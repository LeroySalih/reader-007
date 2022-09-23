import {supabase} from '../config/supabase';

export const getRubrics = async () => {

    const {data, error} = await supabase
                            .from("Rubrics")
                            .select()

    // etRubrics(data);
    return data;

}

export const getRubric = async (id) => {

    const {data, error} = await supabase
                            .from("Rubrics")
                            .select()
                            .eq('id', id)
                            .single();

    data != undefined && console.log("Rubric", data)
    error != undefined && console.error(error)

    return data;

}