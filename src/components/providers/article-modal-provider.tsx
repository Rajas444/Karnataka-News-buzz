
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ArticleModalContextType {
  isOpen: boolean;
  articleId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}

const ArticleModalContext = createContext<ArticleModalContextType | undefined>(undefined);

export const ArticleModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);

  const onOpen = (id: string) => {
    setIsOpen(true);
    setArticleId(id);
    // Optionally update URL
    // window.history.pushState({}, '', `/news/${id}`);
  };

  const onClose = () => {
    setIsOpen(false);
    setArticleId(null);
     // Optionally update URL
    // window.history.pushState({}, '', window.location.pathname.split('/news/')[0]);
  };

  return (
    <ArticleModalContext.Provider value={{ isOpen, articleId, onOpen, onClose }}>
      {children}
    </ArticleModalContext.Provider>
  );
};

export const useArticleModal = () => {
  const context = useContext(ArticleModalContext);
  if (context === undefined) {
    throw new Error('useArticleModal must be used within an ArticleModalProvider');
  }
  return context;
};
