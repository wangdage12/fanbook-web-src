import { Snowflake } from '@theinternetfolks/snowflake'
import { random } from 'lodash-es'

// 请勿修改这两个参数，客户端与服务端的 snowflake 生成器必须保持一致
const FB_EPOCH = Date.parse('2019-08-08T08:08:08+08:00')
const shard_id = random(0, 32, false)
export default function generateSnowFlakeId() {
  return BigInt(
    Snowflake.generate({
      timestamp: Date.now() - FB_EPOCH,
      shard_id,
    })
  )
}

export function convertSnowflakeToDate(snowflake: bigint) {
  // https://discord.com/developers/docs/reference#snowflakes
  const milliseconds = snowflake >> 22n
  return Number(milliseconds) + FB_EPOCH
}
