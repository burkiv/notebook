import { useState } from 'react';
import styled from 'styled-components';
import NotebookPage, { RecipeData, DroppedIcon } from './components/NotebookPage';
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
`;

const exampleRecipe: RecipeData = {
  id: 1,
  title: 'Çikolatalı Kek Tarifi',
  leftPageText: `Malzemeler:\n• 3 yumurta\n• 1,5 su bardağı şeker\n• 1,5 su bardağı süt\n• 1 su bardağı sıvı yağ\n• 2,5 su bardağı un\n• 3 yemek kaşığı kakao\n• 1 paket kabartma tozu\n• 1 paket vanilya`,
  rightPageText: `Hazırlanışı:\n1. Fırını 180 derecede ısıtın\n2. Yumurta ve şekeri çırpın\n3. Süt ve yağı ekleyip karıştırın\n4. Kuru malzemeleri eleyerek ekleyin\n5. Karışımı yağlanmış kek kalıbına dökün\n6. 35-40 dakika pişirin`,
  icons: [],
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
  z-index: 50;
  border-radius: 5px;
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  &.prev {
    left: 30px;
  }

  &.next {
    right: 30px;
  }
`;

function App() {
  const [mode, setMode] = useState<'view' | 'new'>('view');
  const [recipes, setRecipes] = useState<RecipeData[]>([exampleRecipe]);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [newRecipeData, setNewRecipeData] = useState<RecipeData | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const handleIconClick = (iconSrc: string) => {
    if (mode === 'new') {
      setSelectedIcon(prevSelected => prevSelected === iconSrc ? null : iconSrc);
    }
  };

  const handleStartNewRecipe = () => {
    setMode('new');
    setNewRecipeData({
      id: Date.now(),
      leftPageText: '',
      rightPageText: '',
      icons: []
    });
    setSelectedIcon(null);
  };

  const handleSaveNewRecipe = () => {
    if (newRecipeData) {
      const recipeToSave = { ...newRecipeData, id: Date.now() };
      setRecipes((prev: RecipeData[]) => [...prev, recipeToSave]);
      setCurrentRecipeIndex(recipes.length);
    }
    setMode('view');
    setNewRecipeData(null);
    setSelectedIcon(null);
  };

  const handleCancelNewRecipe = () => {
    setMode('view');
    setNewRecipeData(null);
    setSelectedIcon(null);
  };

  const handleUpdateNewRecipeData = (updatedData: Partial<RecipeData>) => {
    if (mode === 'new' && newRecipeData) {
      setNewRecipeData((prev: RecipeData | null) => ({
        ...(prev as RecipeData),
        ...updatedData
      }));
    }
  };

  const handleIconPlaced = () => {
    if (mode === 'new') {
      setSelectedIcon(null);
    }
  };

  const goToNextPage = () => {
    if (mode === 'view' && recipes.length > 0) {
      setCurrentRecipeIndex(prevIndex => (prevIndex + 1) % recipes.length);
    }
  };

  const goToPrevPage = () => {
     if (mode === 'view' && recipes.length > 0) {
      setCurrentRecipeIndex(prevIndex => (prevIndex - 1 + recipes.length) % recipes.length);
    }
  };

  const currentDisplayData = mode === 'new' ? newRecipeData : recipes[currentRecipeIndex];

  return (
    <AppContainer>
      <IconPanel
        isVisible={mode === 'new'}
        onIconClick={handleIconClick}
        selectedIcon={selectedIcon}
      />
      <NotebookPage
        key={currentDisplayData?.id ?? 'new'}
        isEditing={mode === 'new'}
        selectedIcon={selectedIcon}
        onIconPlaced={handleIconPlaced}
        initialData={currentDisplayData}
        onUpdate={handleUpdateNewRecipeData}
      />
      {mode === 'view' && recipes.length > 1 && (
        <>
          <NavButton className="prev" onClick={goToPrevPage}>&lt;</NavButton>
          <NavButton className="next" onClick={goToNextPage}>&gt;</NavButton>
        </>
      )}
      {mode === 'new' && (
        <>
          <ActionButton className="save" onClick={handleSaveNewRecipe}>Kaydet</ActionButton>
          <ActionButton className="cancel" onClick={handleCancelNewRecipe}>İptal</ActionButton>
        </>
      )}
      <Pencil3D onClick={mode === 'view' ? handleStartNewRecipe : () => {}} />
    </AppContainer>
  );
}

export default App;
