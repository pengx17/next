import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { NuToolBar } from './Toolbar'
import { StatusBar } from './StatusBar'
import { PrimaryTools } from './PrimaryTools'

export const AppUI = observer(function AppUI() {
  return (
    <>
      <NuToolBar />
      <StatusBar />
      <PrimaryTools />
    </>
  )
})
