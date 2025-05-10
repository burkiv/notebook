import { useState, useMemo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import RecipeFlipbook from './components/RecipeFlipbook';
import Cover from './components/Cover';
import { RecipePageData, DroppedIcon } from './components/RecipePage';
import Pencil3D from './components/Pencil3D';
import IconPanel from './components/IconPanel';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: #f0f0f0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  perspective: 2000px;
`;

const NotebookWrapper = styled.div`
  position: relative;
  width: 1400px;
  height: 800px;
  transform-style: preserve-3d;
  margin: auto;
`;

const OverlayEditableText = styled.textarea<{ $isTextEditable?: boolean }>`
  position: fixed;
  background: transparent;
  border: none;
  font-family: 'Architects Daughter', cursive;
  font-size: 1.2em;
  color: #444;
  line-height: 1.6;
  resize: none;
  outline: none;
  z-index: 1002;
  pointer-events: ${(props) => (props.$isTextEditable ? 'auto' : 'none')};
  padding: 0;
  margin: 0;
  overflow-y: hidden; /* Dikey scrollbar'ı engelle */
`;

const PageFullWarning = styled.div`
  position: fixed;
  bottom: 80px; /* Butonların biraz üzerinde */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(200, 0, 0, 0.8);
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  z-index: 2000; /* En üstte */
  font-size: 0.9em;
`;

interface Recipe {
  id: number;
  title?: string;
  leftPageText: string;
  rightPageText: string;
  iconsLeft: DroppedIcon[];
  iconsRight: DroppedIcon[];
}

const exampleRecipe: Recipe = {
  id: 1,
  title: 'Çikolatalı Kek Tarifi',
  leftPageText: `Malzemeler:\n• 3 yumurta\n• 1,5 su bardağı şeker\n• 1,5 su bardağı süt\n• 1 su bardağı sıvı yağ\n• 2,5 su bardağı un\n• 3 yemek kaşığı kakao\n• 1 paket kabartma tozu\n• 1 paket vanilya`,
  rightPageText: `Hazırlanışı:\n1. Fırını 180 derecede ısıtın\n2. Yumurta ve şekeri çırpın\n3. Süt ve yağı ekleyip karıştırın\n4. Kuru malzemeleri eleyerek ekleyin\n5. Karışımı yağlanmış kek kalıbına dökün\n6. 35-40 dakika pişirin`,
  iconsLeft: [],
  iconsRight: [],
};

const ActionButton = styled.button`
  position: absolute;
  bottom: 30px;
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  z-index: 1000;
  border-radius: 5px;
  opacity: 0.9;
  transition: opacity 0.2s, background-color 0.2s;

  &:hover {
    opacity: 1;
    background-color: #0056b3;
  }

  &.save {
    right: 140px;
  }

  &.cancel {
    right: 30px;
    background-color: #6c757d;
    &:hover {
      background-color: #545b62;
    }
  }
`;

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<'view' | 'new'>('view');
  const [recipes, setRecipes] = useState<Recipe[]>([exampleRecipe]);
  const [newRecipeBuffer, setNewRecipeBuffer] = useState<Recipe | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showPageFullWarning, setShowPageFullWarning] = useState(false);
  const notebookWrapperRef = useRef<HTMLDivElement>(null);
  const overlayTextareaRef = useRef<HTMLTextAreaElement>(null);

  const recipePages = useMemo((): RecipePageData[] => {
    const pages: RecipePageData[] = [];
    recipes.forEach((recipe) => {
      pages.push({
        id: recipe.id * 2,
        text: recipe.leftPageText,
        icons: recipe.iconsLeft,
      });
      pages.push({
        id: recipe.id * 2 + 1,
        text: recipe.rightPageText,
        icons: recipe.iconsRight,
      });
    });
    return pages;
  }, [recipes]);

  const newRecipePages = useMemo((): RecipePageData[] | null => {
    if (!newRecipeBuffer) return null;
    return [
      { id: newRecipeBuffer.id * 2, text: newRecipeBuffer.leftPageText, icons: newRecipeBuffer.iconsLeft },
      { id: newRecipeBuffer.id * 2 + 1, text: newRecipeBuffer.rightPageText, icons: newRecipeBuffer.iconsRight },
    ];
  }, [newRecipeBuffer]);

  const handleIconClick = (iconSrc: string) => {
    if (isEditing) {
      setSelectedIcon((prevSelected) => (prevSelected === iconSrc ? null : iconSrc));
    }
  };

  const handleOpenNotebook = () => {
    if (!isEditing) {
      setIsOpen(true);
    }
  };

  const handleCloseNotebook = () => {
    setIsOpen(false);
    setMode('view');
    setIsEditing(false);
    setSelectedIcon(null);
    setNewRecipeBuffer(null);
  };

  const handleStartNewRecipe = () => {
    if (isOpen && mode === 'view') {
      setMode('new');
      setIsEditing(true);
      setNewRecipeBuffer({
        id: Date.now(),
        leftPageText: '',
        rightPageText: '',
        iconsLeft: [],
        iconsRight: [],
      });
      setSelectedIcon(null);
      setCurrentPageIndex(0);
    }
  };

  const handleSaveNewRecipe = () => {
    if (newRecipeBuffer) {
      setRecipes((prev) => [...prev, { ...newRecipeBuffer, id: Date.now() }]);
    }
    setMode('view');
    setIsEditing(false);
    setNewRecipeBuffer(null);
    setSelectedIcon(null);
  };

  const handleCancelNewRecipe = () => {
    setMode('view');
    setIsEditing(false);
    setNewRecipeBuffer(null);
    setSelectedIcon(null);
  };

  const handleOverlayTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    const isLeftPage = currentPageIndex % 2 === 0;

    if (isTextareaOverflowing(overlayTextareaRef.current, newText) && newText.length > currentText.length) {
      setShowPageFullWarning(true);
      setTimeout(() => setShowPageFullWarning(false), 2000);
      return;
    }

    if (mode === 'new' && newRecipeBuffer) {
      setNewRecipeBuffer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          leftPageText: isLeftPage ? newText : prev.leftPageText,
          rightPageText: !isLeftPage ? newText : prev.rightPageText,
        };
      });
    } else if (mode === 'view' && isEditing) {
      const recipeToEditIndex = Math.floor(currentPageIndex / 2);
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe, index) => {
          if (index !== recipeToEditIndex) return recipe;
          return {
            ...recipe,
            leftPageText: isLeftPage ? newText : recipe.leftPageText,
            rightPageText: !isLeftPage ? newText : recipe.rightPageText,
          };
        })
      );
    }
  };

  const handleUpdatePageIcons = (pageIndex: number, updatedIcons: DroppedIcon[]) => {
    const isLeftPageUpdate = pageIndex % 2 === 0;
    if (mode === 'new' && newRecipeBuffer) {
      setNewRecipeBuffer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          iconsLeft: isLeftPageUpdate ? updatedIcons : prev.iconsLeft,
          iconsRight: !isLeftPageUpdate ? updatedIcons : prev.iconsRight,
        };
      });
    }
  };

  const handleIconPlaced = () => {
    if (isEditing) {
      setSelectedIcon(null);
    }
  };

  const handlePageFlip = (pageIndex: number) => {
    console.log('Flipped to page:', pageIndex);
    setCurrentPageIndex(pageIndex);
    setSelectedIcon(null);
    if (isEditing && overlayTextareaRef.current) {
      setTimeout(() => {
        console.log('Refocusing overlay textarea after flip');
        overlayTextareaRef.current?.focus();
        const val = overlayTextareaRef.current?.value || '';
        overlayTextareaRef.current?.setSelectionRange(val.length, val.length);
      }, 50);
    }
  };

  const isTextEditingMode = isEditing && !selectedIcon;

  const isTextareaOverflowing = (textarea: HTMLTextAreaElement | null, newText: string): boolean => {
    if (!textarea) return false;
    const originalValue = textarea.value;
    textarea.value = newText;
    const isOverflowing = textarea.scrollHeight > textarea.clientHeight;
    textarea.value = originalValue;
    return isOverflowing;
  };

  useEffect(() => {
    if (isOpen && isTextEditingMode && overlayTextareaRef.current) {
      console.log('Focusing overlay textarea');
      overlayTextareaRef.current.focus();
      const val = overlayTextareaRef.current.value || '';
      overlayTextareaRef.current.setSelectionRange(val.length, val.length);
    }
  }, [isOpen, isTextEditingMode, currentPageIndex]);

  const pagesToDisplay = mode === 'new' ? newRecipePages || [] : recipePages;

  const currentText = useMemo(() => {
    if (!isTextEditingMode) return '';
    const targetRecipe = mode === 'new' ? newRecipeBuffer : recipes[Math.floor(currentPageIndex / 2)];
    if (!targetRecipe) {
      console.log('currentText: No target recipe found for pageIndex', currentPageIndex);
      return '';
    }
    const text = currentPageIndex % 2 === 0 ? targetRecipe.leftPageText : targetRecipe.rightPageText;
    console.log('currentText for pageIndex', currentPageIndex, ':', text);
    return text;
  }, [isTextEditingMode, mode, currentPageIndex, newRecipeBuffer, recipes]);

  const overlayTextareaStyle = useMemo(() => {
    if (!isOpen || !notebookWrapperRef.current) {
      return { display: 'none' };
    }

    const bookRect = notebookWrapperRef.current.getBoundingClientRect();
    const pageW = 700;
    const pageOuterPadding = 40;
    const textInnerPadding = 20;

    const textActualLeftOffsetInPage = pageOuterPadding + textInnerPadding;
    const textActualTopOffsetInPage = pageOuterPadding + textInnerPadding;

    const textAreaContentWidth = pageW - 2 * pageOuterPadding - 2 * textInnerPadding;
    const textAreaContentHeight = 800 - 2 * pageOuterPadding - 2 * textInnerPadding;

    const top = bookRect.top + textActualTopOffsetInPage;
    let left;
    const isLeftPage = currentPageIndex % 2 === 0;

    if (isLeftPage) {
      left = bookRect.left + textActualLeftOffsetInPage;
    } else {
      left = bookRect.left + pageW + textActualLeftOffsetInPage;
    }

    console.log('Overlay Style:', { top, left, width: textAreaContentWidth, height: textAreaContentHeight, isTextEditingMode, display: isTextEditingMode ? 'block' : 'none' });

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${textAreaContentWidth}px`,
      height: `${textAreaContentHeight}px`,
      padding: `0px`,
      display: isTextEditingMode ? 'block' : 'none',
    } as React.CSSProperties;
  }, [isOpen, currentPageIndex, notebookWrapperRef.current, isTextEditingMode]);

  return (
    <AppContainer>
      <IconPanel isVisible={isEditing} onIconClick={handleIconClick} selectedIcon={selectedIcon} />

      <NotebookWrapper ref={notebookWrapperRef}>
        <AnimatePresence>
          {!isOpen && <Cover key="cover" onClick={handleOpenNotebook} />}
        </AnimatePresence>

        {isOpen && (
          <RecipeFlipbook
            key={mode === 'new' ? 'new-book' : `book-${recipes.length}`}
            recipes={pagesToDisplay}
            isEditing={isEditing}
            selectedIcon={selectedIcon}
            onIconPlaced={handleIconPlaced}
            onUpdatePageIcons={handleUpdatePageIcons}
            closeBook={handleCloseNotebook}
            onPageFlip={handlePageFlip}
            isTextEditingOverlayActive={isTextEditingMode}
          />
        )}
      </NotebookWrapper>

      {isOpen && (
        <OverlayEditableText
          ref={overlayTextareaRef}
          style={overlayTextareaStyle}
          value={currentText}
          onChange={handleOverlayTextChange}
          placeholder={currentPageIndex % 2 === 0 ? 'Başlık ve Malzemeler...' : 'Hazırlanışı...'}
          spellCheck={false}
        />
      )}

      {showPageFullWarning && <PageFullWarning>Sayfa Dolu!</PageFullWarning>}

      {isOpen && mode === 'new' && (
        <>
          <ActionButton className="save" onClick={handleSaveNewRecipe}>
            Kaydet
          </ActionButton>
          <ActionButton className="cancel" onClick={handleCancelNewRecipe}>
            İptal
          </ActionButton>
        </>
      )}

      <Pencil3D onClick={isOpen ? handleStartNewRecipe : handleOpenNotebook} />
    </AppContainer>
  );
}

export default App;
