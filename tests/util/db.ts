import { createConnection } from 'typeorm'

export const createDBConnection = async (entities: any): Promise<void> => {
  await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    entities: entities,
    username: 'postgres',
    password: 'Pass2020!',
    database: 'docker_test',
    synchronize: true,
  })
}
