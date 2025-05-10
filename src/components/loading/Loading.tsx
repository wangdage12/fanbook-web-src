import React from 'react'
import './loading.css'

const Loading: React.FC = () => {
  return (
    <div className="loading-wrapper">
      <div className="loading-content">
        <div className="top"></div>
        <div className="right"></div>
        <div className="bottom"></div>
        <div className="left"></div>
        <div className="top-header"></div>
      </div>
    </div>
  )
}
export default Loading
