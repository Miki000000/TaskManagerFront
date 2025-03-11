export type Call = {
  problem: string;
  solution: string;
  name: string;
  company: string;
  userId?: string;
  username?: string;
  id?: number;
  creationDate?: string;
};

export type Note = {
  title: string;
  company: string;
  contact: string;
  situation: string;
  userId?: string;
  username?: string;
  id?: number;
  creationDate?: string;
};

export type Task = {
  title: string;
  description: string;
  companies: string[];
  attributedUser: string;
  createdBy: string;
  id?: number;
  creationDate?: string;
  completedDate?: string;
  completed?: boolean;
};
