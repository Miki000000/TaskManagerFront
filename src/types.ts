export type Call = {
  problem: string;
  solution: string;
  name: string;
  company: string;
  userId?: string;
  id?: number;
  creationDate?: string;
};

export type Note = {
  title: string;
  company: string;
  contact: string;
  situation: string;
  userId?: string;
  id?: number;
  creationDate?: string;
};
