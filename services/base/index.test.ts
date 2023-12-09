import BaseService from '@services/base'

// Mock dependencies.
jest.mock('@tracer', () => ({
  trace: jest.fn().mockImplementation((name, fn) => fn()),
}))
class MockService extends BaseService<any> {
  create(data: any): Promise<any> {
    return Promise.resolve(data)
  }

  delete(id: string): Promise<any> {
    return Promise.resolve({ id })
  }

  deleteMany(args: any): Promise<any> {
    return Promise.resolve({ count: args.length })
  }

  find(args: any): Promise<any | null> {
    return Promise.resolve(args)
  }

  findMany(args: any): Promise<any[]> {
    return Promise.resolve(args)
  }

  get(id: string, options: any): Promise<any | null> {
    return Promise.resolve({ id, ...options })
  }

  update(id: string, data: any): Promise<any> {
    return Promise.resolve({ id, ...data })
  }

  upsert(args: any): Promise<any> {
    return Promise.resolve(args)
  }
}

describe('BaseService', () => {
  let mockService: MockService

  beforeEach(() => {
    mockService = new MockService()
  })

  it('should have a create method', async () => {
    const data = { name: 'test' }
    const result = await mockService.create(data)
    expect(result).toEqual(data)
  })

  it('should have a delete method', async () => {
    const result = await mockService.delete('1')
    expect(result).toEqual({ id: '1' })
  })

  it('should have a deleteMany method', async () => {
    const result = await mockService.deleteMany(['1', '2'])
    expect(result).toEqual({ count: 2 })
  })

  it('should have a find method', async () => {
    const result = await mockService.find({ name: 'test' })
    expect(result).toEqual({ name: 'test' })
  })

  it('should have a findMany method', async () => {
    const result = await mockService.findMany({ name: 'test' })
    expect(result).toEqual({ name: 'test' })
  })

  it('should have a get method', async () => {
    const result = await mockService.get('1', { name: 'test' })
    expect(result).toEqual({ id: '1', name: 'test' })
  })

  it('should have a update method', async () => {
    const result = await mockService.update('1', { name: 'test' })
    expect(result).toEqual({ id: '1', name: 'test' })
  })

  it('should have a upsert method', async () => {
    const result = await mockService.upsert({ name: 'test' })
    expect(result).toEqual({ name: 'test' })
  })
})
