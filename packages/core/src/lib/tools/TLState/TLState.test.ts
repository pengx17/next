import { createState } from './TLState'

describe('TLState', () => {
  it('Creates states', () => {
    const state = createState({
      id: 'AA',
    })

    expect(state).toBeDefined()
  })

  it('Activates initial states', () => {
    const AAA = createState({
      id: 'AAA',
    })

    const AAB = createState({
      id: 'AAB',
    })

    const AA = createState({
      id: 'AA',
      initial: 'AAA',
      children: [AAA, AAB],
    })

    const AB = createState({
      id: 'AB',
    })

    const state = createState({
      id: 'select',
      initial: 'AA',
      children: [AA, AB],
    })

    state.events.onEnter({ fromId: 'none' })
    expect(state.currentState).toBe(AA)
    expect(state.isActive).toBe(true)
    expect(AA.isActive).toBe(true)
    expect(AB.isActive).toBe(false)
    expect(AAA.isActive).toBe(true)
    expect(AAB.isActive).toBe(false)
  })

  it('Transitions', () => {
    const AAA = createState({
      id: 'AAA',
    })

    const AAB = createState({
      id: 'AAB',
    })

    const AA = createState({
      id: 'AA',
      initial: 'AAA',
      children: [AAA, AAB],
    })

    const AB = createState({
      id: 'AB',
    })

    const state = createState({
      id: 'select',
      initial: 'AA',
      children: [AA, AB],
    })

    state.events.onEnter({ fromId: 'none' })
    state.transition('AB')
    expect(state.currentState).toBe(AB)
    expect(state.isActive).toBe(true)
    expect(AA.isActive).toBe(false)
    expect(AB.isActive).toBe(true)
    expect(AAA.isActive).toBe(false)
    expect(AAB.isActive).toBe(false)
  })
})
