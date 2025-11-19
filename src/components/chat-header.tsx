import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { MoreVertical } from "lucide-react"

export function ChatHeader() {
  const avatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

  return (
    <header className="flex items-center p-3 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border">
          {avatar && <AvatarImage src={avatar.imageUrl} alt={avatar.description} data-ai-hint={avatar.imageHint} />}
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-bold text-lg font-headline">A.I Astrologer</h2>
          <p className="text-sm text-muted-foreground">Online</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreVertical className="h-5 w-5" />
          <span className="sr-only">More options</span>
        </Button>
      </div>
    </header>
  )
}
