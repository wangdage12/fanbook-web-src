import { Outlet, useParams } from 'react-router-dom'
import FileUnknown from '../../assets/images/file_unknown.svg'
import EmptyPage from '../../components/EmptyPage.tsx'
import QuestionPanel from './QuestionPanel'

function QuestionWrapper() {
  const { questionId } = useParams()
  return (
    <div className="grid min-w-[900px] grid-cols-5 overflow-hidden">
      <div className="col-span-2 ">
        <QuestionPanel />
      </div>
      <div className="col-span-3 h-full overflow-hidden py-2 pr-4">
        {questionId ?
          <Outlet key={questionId} />
        : <EmptyPage message={null} context={'点击左侧问题浏览内容'} image={FileUnknown} imageSize={36} />}
      </div>
    </div>
  )
}

export default QuestionWrapper
