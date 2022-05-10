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

(def persist-key "playground.index")

;; from apps/logseq/src/documents/dev.ts
(def dev-doc-model
  {:currentPageId "page1",
   :selectedIds ["yt1" "yt2"],
   :pages
   [{:name "Page",
     :id "page1",
     :shapes
     [{:id "yt1",
       :type "youtube",
       :parentId "page1",
       :point [100 100],
       :size [160 90],
       :embedId ""}
      {:id "yt2",
       :type "youtube",
       :parentId "page1",
       :point [300 300],
       :size [160 90],
       :embedId ""}],
     :bindings []}],
   :assets []})

(set! *warn-on-infer* false)

;; Debounce it?
(defn on-persist [app]
  (println (.-serialized app))
  (let [document (.-serialized app)]
    ;; persit to localstorage
    (.setItem js/sessionStorage persist-key (js/JSON.stringify document))))

(defn on-load []
  (if-let [raw-str (.getItem js/sessionStorage persist-key)]
    (js->clj (js/JSON.parse raw-str))
    dev-doc-model))

(def model (on-load))

(println model)

(rum/defc Tldraw []
  (app-provider {:Shapes shapes
                 :model model
                 :Tools tools
                 :onPersist on-persist}
                [:div.wrapper
                 (app-canvas {:components components})
                 (app-ui)]))
