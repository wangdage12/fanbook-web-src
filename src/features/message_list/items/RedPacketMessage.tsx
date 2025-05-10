export default function RedPacketMessage() {
  return (
    <div
      className={'relative'}
      style={{
        width: 228,
        height: 104,
      }}
    >
      <img draggable={false} src="/images/RedPacket.svg" alt="红包" />
      <div className={'absolute left-0 right-0 top-2.5 select-none text-center text-base font-medium text-[#FFD499]'}>
        你收到了一个红包
        <br />
        请在手机上查看
      </div>
    </div>
  )
}
