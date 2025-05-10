import React, { useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import styled from 'styled-components';
import RecipePage, { RecipePageData, DroppedIcon } from './RecipePage';

const FlipbookContainer = styled.div`
  width: 1400px;
  height: 800px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
`;

interface RecipeFlipbookProps {
  recipes: RecipePageData[];
  startPage?: number;
  isEditing?: boolean;
  isTextEditingOverlayActive?: boolean; // Yeni prop
  selectedIcon?: string | null;
  onIconPlaced?: () => void;
  onUpdatePageIcons?: (pageIndex: number, icons: DroppedIcon[]) => void;
  closeBook?: () => void;
  onPageFlip: (pageIndex: number) => void;
}

const RecipeFlipbook: React.FC<RecipeFlipbookProps> = ({
  recipes,
  startPage = 0,
  isEditing,
  isTextEditingOverlayActive, // Prop'u al
  selectedIcon,
  onIconPlaced,
  onUpdatePageIcons,
  closeBook,
  onPageFlip
}) => {
  const flipBook = useRef<InstanceType<typeof HTMLFlipBook> | null>(null);

  const handleFlip = useCallback((e: { data: number }) => {
    onPageFlip(e.data);
  }, [onPageFlip]);

  const NavButton = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0,0,0,0.4);
    color: white;
    border: none;
    padding: 15px 10px;
    font-size: 20px;
    cursor: pointer;
    z-index: 1001;
    border-radius: 5px;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }

    &.prev {
      left: -50px;
    }

    &.next {
      right: -50px;
    }
  `;

  const flipNext = () => {
    flipBook.current?.pageFlip().flipNext();
  };

  const flipPrev = () => {
    const currentPageIndex = flipBook.current?.pageFlip().getCurrentPageIndex();
    if (currentPageIndex !== undefined && currentPageIndex === 0) {
      closeBook?.();
    } else {
      flipBook.current?.pageFlip().flipPrev();
    }
  };

  return (
    <FlipbookContainer>
      <HTMLFlipBook
        width={700}
        height={800}
        size="stretch"
        minWidth={300}
        maxWidth={700}
        minHeight={400}
        maxHeight={800}
        maxShadowOpacity={0.5}
        showCover={false}
        mobileScrollSupport={true}
        ref={flipBook}
        startPage={startPage}
        onFlip={handleFlip}
        className="recipe-flipbook"
      >
        {recipes.map((pageData, index) => (
          <RecipePage
            key={pageData.id}
            pageNumber={index}
            initialData={pageData}
            isEditing={isEditing}
            isTextEditingOverlayActive={isTextEditingOverlayActive} // İlet
            selectedIcon={selectedIcon}
            onIconPlaced={onIconPlaced}
            onUpdateIcons={onUpdatePageIcons}
          />
        ))}
      </HTMLFlipBook>
      {!isEditing && recipes.length > 0 && (
        <>
          <NavButton className="prev" onClick={flipPrev}>&lt;</NavButton>
          <NavButton className="next" onClick={flipNext}>&gt;</NavButton>
        </>
      )}
    </FlipbookContainer>
  );
};

export default RecipeFlipbook;
