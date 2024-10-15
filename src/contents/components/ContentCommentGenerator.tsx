import GroupedModelSelector from "~components/GroupedModelSelector"
import { useLanguage } from "~components/LanguageSwitcher/LanguageContext"
import { useTranslation } from "~components/LanguageSwitcher/useTranslation"
import { Button } from "~components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "~components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "~components/ui/tooltip"
import { LENGTH_MAP } from "~lib/constant"
import { useProductDetails } from "~lib/useProductDetails"
import { openTwitter } from "~lib/utils"
import { useAIKeys } from "~store/aiKeysStore"
import { useCommentLength } from "~store/useCommentLength"
import type { UserData } from "~types/user"
import { ArrowUpRight, InfoIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { TEXTAREA_SELECTOR } from "../utils/constants"

interface IProps {
  userData: UserData
}

const ContentCommentGenerator = ({ userData }: IProps) => {
  const { commentLength, setCommentLength } = useCommentLength()
  const { language } = useLanguage()
  const { selectedCommentModel } = useAIKeys(userData)
  const { productDetails, fetchProductDetails } = useProductDetails()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedComment, setGeneratedComment] = useState("")
  const responseRef = useRef("")

  const handleGenerateComment = async (event: React.MouseEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setGeneratedComment("")
    responseRef.current = ""

    try {
      await fetchProductDetails()
    } catch (err) {
      setError("Failed to fetch product details: " + err.message)
      setIsLoading(false)
      return
    }

    if (productDetails && productDetails.title && productDetails.slogan) {
      sendToBackground({
        // @ts-ignore
        name: "GENERATE_AI_RESPONSE",
        body: {
          source: "content",
          productDetails,
          feature: "comments",
          length: commentLength,
          customModel: selectedCommentModel
        }
      })
        .then((response) => {
          if (response.type === "COMMENTS_ERROR") {
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
    const messageListener = (message) => {
      if (message.type === "COMMENTS_CHUNK") {
        responseRef.current += message.data
        setGeneratedComment(responseRef.current)
      } else if (message.type === "COMMENTS_DONE") {
        setIsLoading(false)
      } else if (message.type === "COMMENTS_ERROR") {
        setError(message.error)
        setIsLoading(false)
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  // 填充到 ProductHunt 的评论输入框
  useEffect(() => {
    if (generatedComment) {
      const textarea = document.querySelector(
        TEXTAREA_SELECTOR
      ) as HTMLTextAreaElement
      if (textarea) {
        textarea.value = generatedComment
        // 触发输入事件，确保任何监听输入的脚本都能捕获到变化
        const inputEvent = new Event("input", { bubbles: true })
        textarea.dispatchEvent(inputEvent)
      }
    }
  }, [generatedComment])

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
                {t("commentsPlaceholder")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {userData ? (
          <GroupedModelSelector
            feature="comment"
            userData={userData}></GroupedModelSelector>
        ) : (
          <></>
        )}
        <Select value={commentLength} onValueChange={setCommentLength}>
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder={t("commentLength")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{t("commentLength")}</SelectLabel>
              {LENGTH_MAP.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          disabled={isLoading}
          onClick={handleGenerateComment}
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
          {isLoading ? "Thinking..." : "💬 Comment"}
        </Button>
      </div>
      {error ? (
        <div className="flex justify-end items-baseline text-red-500 text-sm mt-1">
          {error}
          <button
            onClick={() => openTwitter(language)}
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
export default ContentCommentGenerator
