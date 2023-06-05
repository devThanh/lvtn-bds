import Format from 'string-format'
import { ConnectDB } from '../database/connection'
const dataSource = ConnectDB.AppDataSource
export async function excuteProcedure(sql: string, params?: Array<any>) {
    if (params) {
        sql = Format(sql, ...params)
    }
    return dataSource.query(sql)
}
