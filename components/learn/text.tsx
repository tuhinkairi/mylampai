import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Lessonsdiv01 from "./lessondivdropdown";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function App() {

  return (
    <div className="flex flex-col gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open Modal</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
        <VisuallyHidden>
                <DialogTitle>
                  hidden title
                </DialogTitle>
              </VisuallyHidden>
          <Lessonsdiv01 />
        </DialogContent>
      </Dialog>
    </div>
  );
}
