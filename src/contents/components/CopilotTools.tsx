import { LanguageProvider } from "~components/LanguageSwitcher/LanguageContext"
import { useUserData } from "~store/useUserData"

import ContentCommentGenerator from "./ContentCommentGenerator"
import ContentOverviewGenerator from "./ContentOverviewGenerator"

const CopilotTools: React.FC = () => {
  const { userData } = useUserData()

  return (
    <LanguageProvider>
      <ContentCommentGenerator userData={userData} />
      <ContentOverviewGenerator userData={userData} />
    </LanguageProvider>
  )
}

export default CopilotTools
