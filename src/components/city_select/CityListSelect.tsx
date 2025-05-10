import { pinyin } from 'pinyin-pro'
import React, { MouseEventHandler, useMemo, useRef } from 'react'

import allCities from './city.json'
import './CityListSelect.css'

interface City {
  countryCode: string
  countryName: string
  countryName_En: string
  phoneCode: string
  key?: string
  letter?: string
}

interface MyCustomComponentProps {
  onPick: (event: City) => void
}

const CityListSelect: React.FC<MyCustomComponentProps> = ({ onPick }) => {
  const listRef = useRef<HTMLUListElement | null>(null)
  const { hotCities, cities, uniqueLetters } = useMemo(() => {
    const cities = allCities.filter(c => !c.key) as City[]
    const hotCities = allCities.filter(c => c.key === '#') as City[]
    cities.sort((a, b) => a.countryName.localeCompare(b.countryName, 'zh-CN'))
    const letters = cities.map(city => {
      city.letter = pinyin(city.countryName[0], {
        pattern: 'first',
        toneType: 'none',
      })
      return city.letter
    })
    const uniqueLetters = [...new Set(letters)].sort()
    return { hotCities, cities, uniqueLetters }
  }, [])

  // 获取所有城市的首字母列表

  return (
    <div className="city-list-select">
      <ul className="city-list" ref={listRef}>
        <li key={'hot'}>
          <ul key={'hot'}>
            {hotCities.map(city => {
              return <CityItem key={city.phoneCode} city={city} onClick={() => onPick(city)}></CityItem>
            })}
          </ul>
        </li>
        {uniqueLetters.map(letter => (
          <li key={letter}>
            <div className="letter-title">{letter.toUpperCase()}</div>
            <ul key={letter}>
              {cities.map(city =>
                city.letter === letter ? <CityItem key={city.phoneCode} city={city} onClick={() => onPick(city)}></CityItem> : null
              )}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CityItem({ city, onClick }: { city: City; onClick: MouseEventHandler }) {
  return (
    <li key={city.countryName_En} className="city-item">
      <div className={'cursor-pointer text-[var(--fg-b100)] hover:text-[var(--fg-blue-1)]'} onClick={onClick}>
        <span className={'mr-[6px] inline-block min-w-[45px]'}>+{city.phoneCode}</span>
        {city.countryName}
      </div>
    </li>
  )
}

export default CityListSelect
