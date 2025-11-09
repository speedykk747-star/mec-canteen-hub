import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { MenuItem, Review } from "@/types";
import { storage } from "@/lib/storage";
import { toast } from "sonner";

interface RatingModalProps {
  item: MenuItem | null;
  userId: string;
  userName: string;
  onClose: () => void;
}

export function RatingModal({ item, userId, userName, onClose }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!item || rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const newReview: Review = {
        userId,
        userName,
        rating,
        comment: comment.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      // Add review to menu item using Firebase
      const success = await storage.addReviewToMenuItem(item.id, newReview);
      
      if (success) {
        toast.success("Thank you for your rating!");
        onClose();
      } else {
        toast.error("Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating");
    }
  };

  return (
    <Dialog open={item !== null} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate {item?.name}</DialogTitle>
          <DialogDescription>Share your experience with this item</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Comment (Optional)</label>
            <Textarea
              placeholder="Tell us what you think..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Submit Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}