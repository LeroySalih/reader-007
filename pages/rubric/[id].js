import Rubric from '../../components/rubric'

import {getRubric, getRubrics} from '../../libs/getRubrics'



const RubricPage = ({rubric}) => {
    
    
    return <Rubric rubric={rubric} />
}


export default RubricPage


export async function getStaticProps(context) {

    const {id} = context.params;
    
    const rubric = await getRubric(id);

    
    return {
      props: {
        rubric
      }, // will be passed to the page component as props
    }
}

export async function getStaticPaths() {

    const rubrics = await getRubrics()
    const paths = rubrics.map((r,i) => ({params: {id: r.id}}));

    return {
      paths,
      fallback: false, // can also be true or 'blocking'
    }
  }