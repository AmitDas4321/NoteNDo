export interface Todo {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  createdAt: number;
  reminderEnabled: boolean;
  phoneNumber?: string;
  reminderSent?: boolean;
  imageUrl?: string;
  reminderDate?: string;
  reminderTime?: string;
}
