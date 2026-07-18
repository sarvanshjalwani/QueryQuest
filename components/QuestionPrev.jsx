export default function QuestionPrev({key,id,title,solved}){
    return (
        <>
        <h1>{id}</h1>
        <h1>{title}</h1>
        <p>{solved}</p>
        </>
    )
}