import { CSSProperties } from 'react'

const CircularLoading = ({ style, className = '', size = 16 }: { style?: CSSProperties; className?: string; size?: number }) => {
  return <iconpark-icon style={style} size={size} name="Loading-Blue" spin class={className} />
}

export default CircularLoading
