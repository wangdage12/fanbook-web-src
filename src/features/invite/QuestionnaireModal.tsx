import { Button, Checkbox, Radio } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useState } from 'react'
import { QuestionStruct, QuestionStructForJoinAndWelcome, QuestionType } from '../guild_setting/sub_pages/AssignRoleSettings.tsx'
import { Questionnaire } from './invite_api'

export enum QuestionnaireType {
  Test,
  Role,
}

interface QuestionItemProps {
  question: QuestionStruct
  index: number
  userAnswers: Record<number, string[]>
  onChange: (index: number, val: string[]) => void
  type: QuestionnaireType
  key: string
}

const questionItemClassName = 'py-[8px]'
const questionClassName = 'text-xm my-[10px] font-medium text-[var(--fg-b100)]'
const answerClassName = 'text-xm h-[40px] text-[var(--fg-b100)] flex items-center gap-[8px]'
export default function QuestionnaireModal({
  questionnaire,
  defaultAnswers,
  type,
  destroy,
  onConfirm,
}: {
  questionnaire: Questionnaire
  defaultAnswers?: Record<number, string[]>
  type: QuestionnaireType
  destroy: () => void
  onConfirm: (correctAnswerNum: number, userAnswers: Record<number, string[]>) => void
}) {
  // const [confirmLoading, setConfirmLoading] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({})

  useEffect(() => {
    const userAnswers: Record<number, string[]> = {}
    questionnaire.questions.forEach((e, i) => (userAnswers[i] = defaultAnswers && defaultAnswers[i] ? defaultAnswers[i] : []))
    setUserAnswers(userAnswers)
  }, [])

  useEffect(() => {
    checkEnabled()
  }, [userAnswers])

  const onChange = (index: number, value: string[]) => {
    setUserAnswers({
      ...userAnswers,
      [index]: value,
    })
  }

  const checkEnabled = () => {
    const enabled = questionnaire.questions.every((e, i) => {
      if (e.type == 'input') return userAnswers[i] && userAnswers[i].length > 0 && userAnswers[i][0]
      return userAnswers[i] && userAnswers[i].length > 0
    })
    setEnabled(enabled)
  }
  const handleSubmit = async () => {
    let correctAnswer = 0
    questionnaire.questions.forEach((e, i) => {
      switch (e.type) {
        case QuestionType.BlankFill:
        case 'radio': {
          if (userAnswers[i] && e.answers && userAnswers[i][0] == e.answers[0]) {
            correctAnswer++
          }
          break
        }
        case QuestionType.MultipleChoice: {
          if (userAnswers[i] && JSON.stringify(userAnswers[i]) == JSON.stringify(e.answers)) {
            correctAnswer++
          }
          break
        }
        case QuestionType.SingleChoice:
          break
      }
    })
    onConfirm(correctAnswer, userAnswers)
  }

  if (Object.keys(userAnswers).length == 0) return null

  return (
    <>
      <div className={'flex-1 pr-2 -mr-2 overflow-auto'}>
        <div className={'mt-[8px] text-sm font-medium text-[var(--fg-b60)]'}>
          {type == QuestionnaireType.Test ? `请完成下列测试题（答对${questionnaire.passNumber}题才能通过）` : '请完成下列问卷题'}
        </div>
        {questionnaire.questions.map((e, i) => {
          const props: QuestionItemProps = {
            question: e,
            index: i,
            key: e.title,
            onChange: onChange,
            type: type,
            userAnswers: userAnswers,
          }
          switch (e.type) {
            case QuestionType.BlankFill:
              return <InputQuestionItem {...props} />
            case QuestionType.SingleChoice:
              return <RadioQuestionItem {...props} question={props.question as never} />
            case QuestionType.MultipleChoice:
              return <CheckBoxQuestionItem {...props} question={props.question as never} />
            default:
              return null
          }
        })}
      </div>
      <div className="ant-modal-footer mb-4">
        <Button onClick={destroy}>取消</Button>
        <Button type="primary" onClick={handleSubmit} disabled={!enabled}>
          提交
        </Button>
      </div>
    </>
  )
}

function InputQuestionItem({ question, index, userAnswers, onChange }: QuestionItemProps) {
  return (
    <div className={questionItemClassName}>
      <div className={questionClassName}>
        {question.title}
        <span className={'ml-[4px] text-[var(--fg-b40)]'}>[填空]</span>
      </div>
      <div>
        <TextArea
          value={userAnswers[index][0]}
          autoSize={{ minRows: 2, maxRows: 2 }}
          onChange={e => {
            onChange(index, [e.target.value as string])
          }}
          placeholder={'填写答案(限制16个字以内)'}
        ></TextArea>
      </div>
    </div>
  )
}

function RadioQuestionItem({
  question,
  index,
  userAnswers,
  onChange,
}: QuestionItemProps & {
  question: QuestionStructForJoinAndWelcome & { type: QuestionType.SingleChoice }
}) {
  return (
    <div className={questionItemClassName}>
      <div className={questionClassName}>
        {question.title}
        <span className={'ml-[4px] text-[var(--fg-b40)]'}>[单选]</span>
      </div>
      <Radio.Group
        value={userAnswers[index][0]}
        onChange={e => {
          onChange(index, [e.target.value])
        }}
      >
        {question.options.map((option, i) => (
          <div className={answerClassName} key={i}>
            <Radio key={i} value={option.content}>
              {option.content}
            </Radio>
          </div>
        ))}
      </Radio.Group>
    </div>
  )
}

function CheckBoxQuestionItem({
  question,
  index,
  userAnswers,
  onChange,
  type,
}: QuestionItemProps & {
  type: QuestionnaireType
  question: QuestionStructForJoinAndWelcome & { type: QuestionType.MultipleChoice }
}) {
  return (
    <div className={questionItemClassName}>
      <div className={questionClassName}>
        {question.title}
        <span className={'ml-[4px] text-[var(--fg-b40)]'}>
          {type == QuestionnaireType.Test ? '[多选]' : `[多选，最多${question.maxAnswers}项目]`}
        </span>
      </div>
      <Checkbox.Group
        value={userAnswers[index]}
        onChange={e => {
          onChange(index, e as string[])
        }}
      >
        {question.options.map((option, i) => (
          <div className={`${answerClassName} w-full`} key={i}>
            <Checkbox key={i} value={option.content}>
              {option.content}
            </Checkbox>
          </div>
        ))}
      </Checkbox.Group>
    </div>
  )
}
