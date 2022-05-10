import * as tldraw from 'tldraw-logseq'

export default App = () => {
  return (
    <tldraw.AppProvider>
      <div className="wrapper">
        <tldraw.AppCanvas />
        <tldraw.AppUIAppCanvas />
      </div>
    </tldraw.AppProvider>
  )
}
