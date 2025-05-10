import { FormInstance } from 'antd'
import { RoleStruct } from 'fb-components/struct/GuildStruct.ts'
import { createContext } from 'react'

export const DEFAULT_COLOR = '#A3A8BF'

export interface RoleGroupManageFormType {
  roles: RoleStruct[]
}
export interface RoleGroupContextProps {
  form: FormInstance<RoleGroupManageFormType>
  role?: RoleStruct
  index?: number
  changeRole: (role: RoleStruct) => void
}

export const RoleGroupContext = createContext<RoleGroupContextProps | undefined>(undefined)
