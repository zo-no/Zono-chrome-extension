import GroupedModelSelector from "~components/GroupedModelSelector"
import { LanguageSwitcher } from "~components/LanguageSwitcher"
import { useTranslation } from "~components/LanguageSwitcher/useTranslation"
import { Button } from "~components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "~components/ui/popover"
import { Toggle } from "~components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "~components/ui/tooltip"
import { useProductDetails } from "~lib/useProductDetails"
import { openTwitter } from "~lib/utils"
import { useAIKeys } from "~store/aiKeysStore"
import { useLanguageStorage } from "~store/useLanguageStorage"
import type { UserData } from "~types/user"
import { ArrowUpRight, InfoIcon, X } from "lucide-react"
import Markdown from "markdown-to-jsx"
import { useEffect, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

interface IProps {
  userData: UserData
}

const ContentOverviewGenerator = ({ userData }: IProps) => {
  const { productDetails, fetchProductDetails } = useProductDetails()
  const { t } = useTranslation()
  const { overviewLang } = useLanguageStorage()
  const { selectedOverviewModel } = useAIKeys(userData)

  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const responseRef = useRef("")

  const handleGenerateOverview = async (event: React.MouseEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setResponse("")
    responseRef.current = ""
    setIsPopoverOpen(true)

    try {
      await fetchProductDetails()
    } catch (err) {
      setError("Failed to fetch product details: " + err.message)
      setIsLoading(false)
    }

    if (productDetails && productDetails.title && productDetails.slogan) {
      sendToBackground({
        // @ts-ignore
        name: "GENERATE_AI_RESPONSE",
        body: {
          source: "content",
          productDetails,
          feature: "overviews",
          language: overviewLang,
          customModel: selectedOverviewModel
        }
      })
        .then((response) => {
          if (response.type === "OVERVIEWS_ERROR") {
            setError(response.message)
            setIsLoading(false)
          }
        })
        .catch((error) => {
          setError(error.message)
          setIsLoading(false)
        })
    }
  }

  useEffect(() => {
    const listener = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.type === "OVERVIEWS_CHUNK") {
        responseRef.current += message.data
        setResponse(responseRef.current)
      } else if (message.type === "OVERVIEWS_DONE") {
        setIsLoading(false)
      } else if (message.type === "OVERVIEWS_ERROR") {
        setError(message.error)
        setIsLoading(false)
      }
      sendResponse({ received: true })
      return true
    }

    chrome.runtime.onMessage.addListener(listener)

    return () => {
      chrome.runtime.onMessage.removeListener(listener)
    }
  }, [])

  const closePopover = () => {
    setIsPopoverOpen(false)
    setResponse("")
    setIsLoading(false)
  }

  return (
    <>
      <div className="flex justify-end items-center mt-2 gap-4">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="text-slate-400 w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-slate-400 text-sm">
                {t("overviewsPlaceholder")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {userData ? (
          <GroupedModelSelector
            feature="overview"
            userData={userData}></GroupedModelSelector>
        ) : (
          <></>
        )}
        <LanguageSwitcher feature="overview" width="w-[70px]" />
        <Popover
          open={isPopoverOpen}
          onOpenChange={() => {
            // 点击 popup 外部区域也无法关闭
            setIsPopoverOpen(true)
          }}>
          <PopoverTrigger asChild>
            <Button
              disabled={isLoading}
              onClick={handleGenerateOverview}
              className="pointer text-white py-2 md:py-0 px-4 md:px-4 text-center inline-block text-base m-0 cursor-pointer rounded transition-colors duration-200"
              style={{
                backgroundColor: "#ff6154",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "4px",
                transition: "background-color 0.2s",
                width: "120px",
                textAlign: "center"
              }}>
              {isLoading ? "Writing..." : "🔍 Overview"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96">
            <div className="space-y-2 flex justify-between items-baseline">
              <h4 className="font-medium leading-none pb-2">
                {t("overviewsTitle")} 🔍
              </h4>
              <Toggle onClick={closePopover}>
                <X className="h-4 w-4" />
              </Toggle>
            </div>
            <div className="space-y-2 text-sm leading-6 text-slate-700">
              {isLoading && !response && (
                <div className="text-slate-500 text-sm">Thinking...</div>
              )}
              {response && (
                <div className="max-h-60 whitespace-pre-wrap overflow-y-auto custom-scrollbar">
                  {/* {generatedOverview} */}
                  <Markdown>{response}</Markdown>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Dialog to show Text Generated by AI */}

      {/* Error */}
      {error ? (
        <div className="flex justify-end items-baseline text-red-500 text-sm mt-1">
          {error}
          <button
            onClick={() => openTwitter(overviewLang)}
            className="relative inline-flex items-center justify-center p-0.5 ml-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
            <span className="relative flex items-center px-5 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              Help
              <ArrowUpRight />
            </span>
          </button>
        </div>
      ) : (
        <></>
      )}
    </>
  )
}
export default ContentOverviewGenerator
