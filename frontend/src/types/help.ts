export interface HelpHeroData {
  title: string;
  intro: string;
}

export interface HelpFaqData {
  heading: string;
  items: { question: string; answer: string }[];
}

export interface HelpContactData {
  email: { title: string; text: string; address: string };
  hotline: { title: string; text: string; number: string };
}
