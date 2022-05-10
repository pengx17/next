(ns playground.tldraw
  (:require [playground.rum :as r]
            ["tldraw-logseq" :as tldraw]))

(def Tldraw (r/adapt-class tldraw/Tldraw))
