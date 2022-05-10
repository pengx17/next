(ns playground.tldraw
  (:require [rum.core :as rum]
            [playground.rum :as r]
            ["tldraw-logseq" :as tldraw]))

(def app-provider (r/adapt-class tldraw/AppProvider))
(def app-canvas (r/adapt-class tldraw/AppCanvas))
(def app-ui (r/adapt-class tldraw/AppUI))

(def components #js{:ContextBar tldraw/ContextBar})
(def shapes (vals (js->clj tldraw/shapes)))
(def tools (vals (js->clj tldraw/tools)))

(rum/defc Tldraw []
  (app-provider {:Shapes shapes
                 :Tools tools}
                [:div.wrapper
                 (app-canvas {:components components})
                 (app-ui)]))
