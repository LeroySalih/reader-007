
import { supabase } from "../../config/supabase";

import { fetchData } from '../../libs/fetchData';
import { v4 as uuidv4 } from 'uuid';

export const cleanTable = async (tableName, idField = 'id') => {
    console.log(`Deleting ${tableName}`)
    const {data, error} = await supabase.from(tableName).delete().neq(idField, 0)
    error != undefined ? console.error(`${tableName}`, error) : console.log(`Deleting ${tableName} done.`);
}

export const cleanDb = async () => {
    
    await cleanTable('Assignments')
    await cleanTable('AssignmentRubricLevels')
    await cleanTable('AssignmentRubricQualityCriteria', 'assignmentId')
    

    await cleanTable('Submissions')
    await cleanTable('Outcomes', 'submissionId')
    await cleanTable('RubricOutcomes','submissionId')
    
}

export const cleanAssignmentFromTable = async (table, field, assignmentId) => {
    return await supabase.from(table).delete().eq(field, assignmentId)
}

export const cleanAssignmentFromDb = async (assignmentId) => {

    const tables = [
        {name: 'Assignments', field: 'id'}, 
        {name: 'AssignmentRubricLevels', field: 'assignmentId'}, 
        {name: 'AssignmentRubricQualityCriteria', field: 'assignmentId'},
        {name: 'Submissions', field: 'assignmentId'},
        {name: 'Outcomes',field: 'assignmentId'},
        {name: 'RubricOutcomes', field: 'assignmentId'}
    ]

    console.log('Cleaning Tables')

    for (const table of tables){
        console.log(`Cleaning ${assignmentId} from ${table.name}`)
        const {data, error} = await cleanAssignmentFromTable(table.name, table.field, assignmentId);
        error != undefined && console.error(error);
    }

    console.log('done')
}




export const processAssignment = async (classId, assignmentId, graphConfig) => {
        
    
    console.log(`Processing ${classId} :: ${assignmentId}`);

    const {instance, account, loginRequest} = graphConfig
    // get data from graph
    const graphAssignment = await fetchData(instance, account, loginRequest, {key: 'getAssignment', classId, assignmentId})

    // convert to DB format
    const dbAssignment = convertGraphAssigmentToDatabase(graphAssignment)
    

    // Check for rubric for this assignment
    const {error:assignmentRubricsError, assignmentRubrics} = await AttemptToGetRubricFromGraphForAssignment(instance, account, loginRequest, 
        {
            key: "getAssignmentRubrics", 
            classId: classId, 
            assignmentId: assignmentId
        }
    );

    assignmentRubricsError && console.error("Error", assignmentRubricsError)
    
    
    dbAssignment['hasRubric'] = (assignmentRubricsError === false);
    
    console.log(assignmentRubrics)
    console.log(dbAssignment)

    // write assignment to the database
    const {data: writeAssignmentResult, error: writeAssignmentError} = await supabase.from('Assignments').upsert(dbAssignment);
    writeAssignmentError === undefined ? console.log("Assignment Write Data", writeAssignmentResult) : console.error("Assignment Write Error", writeAssignmentError)
    // write the rubric to the database
    
    if (dbAssignment['hasRubric'] == true){
        console.log("Writing Rubric")
        writeRubricForAssignmentToDatabase(assignmentId, assignmentRubrics);
    }
    

    // get the submissions for the assignment
    const dbSubmissionsForAssignment = await fetchSubmissionsForAssignment(instance, account, loginRequest, {
        classId, 
        assignmentId
    })

    console.log(`Found ${dbSubmissionsForAssignment.length} submissions`)


    for (const submission of dbSubmissionsForAssignment){
        console.log("Writing Submission")
        const {data, error} = await writeSubmissionToDb(submission, classId, assignmentId);
        error != undefined && console.error("Error", error);
    }

    // get the outcomes for the submissions
    for (const submission of dbSubmissionsForAssignment){

        console.log(`Fetching outcome for submission ${submission.id}`, submission);

        const {outcome, rubricOutcomes} = await fetchOutcomesForSubmisison(instance, account, loginRequest, {
            classId,
            assignmentId,
            submissionId: submission.id,
            userId: submission.userId
        });

        console.log("Outcome", outcome)

        console.log("Writing Outcome to DB", outcome);

        // write the points and feedback outcome
        const {data: writeData, error: writeError} = await supabase.from("Outcomes").upsert(outcome);

        console.log("rubricOutcomes", rubricOutcomes)
        if (rubricOutcomes != null){
            for (const ro of rubricOutcomes){

                console.log("Rubric Outcome", ro);

                const {error} = await supabase.from("RubricOutcomes").upsert(ro);

                error && console.error("Rubric Write Error", error, ro);

            }
        }
    }

}

export const processSingleAssignment = async (assignmentId, graphConfig) => {
        

    console.log(`Processing: ${assignmentId}`);

    const {data, error} = await supabase.from('Assignments').select().eq('id', assignmentId).maybeSingle();
    console.log("Found Data", data)
    const {classId} = data;
    console.log(`Updating ${classId}::${assignmentId}`)
    await cleanAssignmentFromDb(assignmentId);
    await processAssignment(classId, assignmentId, graphConfig);
    console.log("Done")
}

const convertGraphAssigmentToDatabase = (a) => {
    return {
      id: a.id,
      classId: a.classId,
      displayName: a.displayName, 
      webUrl: a.webUrl, 
      createdDateTime: a.createdDateTime,
      dueDateTime: a.dueDateTime,
      // submissionLastUpdated : spacetime([2020, 1, 1]).format('iso')
    }
}

const fetchSubmissionsForAssignment = async (instance, account, loginRequest, ctx) => {

    const submissions = await fetchData(instance, account, loginRequest, {key: 'getSubmissions', ...ctx})

    return submissions.map(s => ({
        id: s.id,
        status: s.status,
        returnedDate: s.returnedDateTime,
        assignmentId: ctx.assignmentId,
        classId: ctx.classId, 
        submittedDate : s.submittedDateTime,
        userId: s.recipient.userId
    }));
    
}

const fetchOutcomesForSubmisison = async (instance, account, loginRequest, ctx) => {

    const outcomes = await fetchData(instance, account, loginRequest, {key: 'getOutcome', ...ctx})
    let rubricOutcomes = null;

    const outcomeId = uuidv4();

    const outcome = {
        
        classId: ctx.classId, 
        assignmentId: ctx.assignmentId,
        submissionId: ctx.submissionId,
        userId: ctx.userId,
        feedback : getFeedback(outcomes),
        points : getPoints(outcomes),
        publishedPoints : getPublishedPoints(outcomes),
        rubricId: getRubricId(outcomes)
    }

    if (outcomes.length == 3){
        rubricOutcomes = getRubricOutcomes(outcomes, ctx)
        
    }
    
    return {outcome, rubricOutcomes};
    
}

const AttemptToGetRubricFromGraphForAssignment = async (instance, account, loginRequest, ctx) => {

    try{

        const assignmentRubrics = await fetchData(instance, account, loginRequest, 
            {
                key: "getAssignmentRubrics", 
                classId: ctx.classId, 
                assignmentId: ctx.assignmentId
            }
            );

        return {error: assignmentRubrics.hasOwnProperty('error'), assignmentRubrics} 
    } catch(e)
    {
        return null;
    }

}


const writeRubricForAssignmentToDatabase = async (assignmentId, rubricResult) => {

    if (rubricResult != null){
    
        console.log("Writing Rubric Levels for Assignment", assignmentId);

        for (const index = 0; index < rubricResult.levels.length; index++) {
            
            const level = rubricResult.levels[index];
            // Write the rubric levels
            console.log("Level", level)
            const {data:writeLevelData, error: writeLevelError} = await supabase.from("AssignmentRubricLevels")
                                                                                .upsert({   assignmentId: assignmentId,
                                                                                            levelId: level.levelId,
                                                                                            index,
                                                                                            displayName: level.displayName
                                                                                });

            writeLevelError != undefined && console.error("Error", writeLevelError);


        }

        console.log("Writing Rubric Qualities for Assignment", assignmentId);
    
        for (const quality of rubricResult.qualities)
        {        
            var criteriaIndex = 0;
            for (const criteria of quality.criteria)
            {
                console.log("Quality Criteria", criteria)

                const {data:writeQualityData, error: writeQualityError} = await supabase.from("AssignmentRubricQualityCriteria")
                                                                                .upsert({   assignmentId: assignmentId,
                                                                                            qualityId: quality.qualityId,
                                                                                            index: criteriaIndex,
                                                                                            description: criteria.description.content,
                                                                                            qualityDescription: quality.description.content
                                                                                });

                writeQualityError != undefined && console.error("Error", writeQualityError);
                criteriaIndex += 1;
            
            }
            /*
            */
        }
    }
}

const writeSubmissionToDb = async(submission) => {

    if (submission === undefined)
      return;

      
    const {data, error} = await supabase
        .from("Submissions")
        .upsert(submission);

    return {data, error}

}

const getFeedback = (os) => {
    try{
        return os.filter(o =>o['@odata.type'] === "#microsoft.graph.educationFeedbackOutcome")[0]['feedback']['text']['content']
    } catch (e) {
        return ''
    }
}

const getPoints = (os) => {
    try{
        return os.filter(o =>o['@odata.type'] === "#microsoft.graph.educationPointsOutcome")[0]['points']['points']
    } catch (e) {
        return null
    }
}

const getPublishedPoints = (os) => {
    try{
        return os.filter(o =>o['@odata.type'] === "#microsoft.graph.educationPointsOutcome")[0]['publishedPoints']['points']
    } catch (e) {
        return null
    }
}

const getRubricId = (os) => {
    try{
        return os.filter(o =>o['@odata.type'] === "#microsoft.graph.educationRubricOutcome")[0]['id']
    } catch (e) {
        return null
    }
}

const getRubricOutcomes = (os, ctx) => {
    try{
        const rubricOutcome = os.filter(o =>o['@odata.type'] === "#microsoft.graph.educationRubricOutcome")[0]
        
        return rubricOutcome['rubricQualitySelectedLevels']
                 .map(ql => ({...ctx, ...ql }))
    } catch (e) {
        return null
    }
}
