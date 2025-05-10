import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// --- Tipleri Export Et ---
export interface DroppedIcon {
  id: number;
  src: string;
  xPercent: number;
  yPercent: number;
}
export interface RecipePageData {
    id: number; // Sayfa için benzersiz ID
    text: string; // Metni göstermek için
    icons: DroppedIcon[];
}
// --- Export Bitti ---

const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding: 40px;
  background: linear-gradient(to right, #f5f5f5 0%, white 3%, white 97%, #f5f5f5 100%);
  background-image:
    linear-gradient(#e0e0e0 1px, transparent 1px),
    linear-gradient(90deg, #e0e0e0 1px, transparent 1px);
  background-size: 25px 25px;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
  border: 1px solid #ddd;
`;

const ClickableOverlay = styled.div<{ $canPlaceIcon?: boolean }>`
  position: absolute;
  top: 40px;
  left: 40px;
  right: 40px;
  bottom: 40px;
  z-index: ${props => props.$canPlaceIcon ? 10 : -1};
  pointer-events: ${props => props.$canPlaceIcon ? 'auto' : 'none'};
  cursor: ${props => props.$canPlaceIcon ? 'copy' : 'default'};
`;

const IconContainer = styled(motion.div)<{ $isEditing?: boolean }>`
  position: absolute;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 11;
  border: 1px dashed transparent;
  transition: border-color 0.2s;
  transform: translate(-50%, -50%);

  &:hover {
    border-color: ${props => props.$isEditing ? 'rgba(255, 0, 0, 0.5)' : 'transparent'};
  }
`;

const IconImage = styled.img`
  width: 100%;
  height: 100%;
  pointer-events: none;
  user-select: none;
  object-fit: contain;
`;

const TextBase = styled.div`
  position: absolute;
  inset: 40px;
  padding: 20px;
  overflow: hidden;
  font-family: 'Architects Daughter', cursive;
  font-size: 1.2em;
  color: #444;
  line-height: 1.6;
  white-space: pre-wrap;
  pointer-events: none;
  z-index: 1;
`;

const RecipeText = styled(TextBase)<{ $isTextBeingEditedOverlay?: boolean }>`
  z-index: 2;
  opacity: ${props => props.$isTextBeingEditedOverlay ? 0 : 1};
  transition: opacity 0.1s;
`;

interface RecipePageProps {
  pageNumber: number;
  isEditing?: boolean;
  isTextEditingOverlayActive?: boolean;
  selectedIcon?: string | null;
  onIconPlaced?: () => void;
  initialData?: RecipePageData | null;
  onUpdateIcons?: (pageIndex: number, icons: DroppedIcon[]) => void;
}

const RecipePage = React.forwardRef<HTMLDivElement, RecipePageProps>((
  { pageNumber, isEditing = false, isTextEditingOverlayActive = false, selectedIcon, onIconPlaced, initialData = null, onUpdateIcons },
  ref
) => {
  const [icons, setIcons] = useState<DroppedIcon[]>(initialData?.icons || []);
  const textToDisplay = initialData?.text || '';

  useEffect(() => {
    setIcons(initialData?.icons || []);
  }, [initialData]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing && selectedIcon) {
        const overlay = event.currentTarget;
        const rect = overlay.getBoundingClientRect();
        const clickXInOverlay = event.clientX - rect.left;
        const clickYInOverlay = event.clientY - rect.top;
        const xPercent = (clickXInOverlay / rect.width) * 100;
        const yPercent = (clickYInOverlay / rect.height) * 100;

        console.log(`Page ${pageNumber} Overlay Click: clickXInOverlay=${clickXInOverlay}, clickYInOverlay=${clickYInOverlay}, overlayWidth=${rect.width}, overlayHeight=${rect.height}, x%=${xPercent}, y%=${yPercent}`);

        const newIcon: DroppedIcon = {
            id: Date.now(),
            src: selectedIcon,
            xPercent: xPercent,
            yPercent: yPercent,
        };
        const updatedIcons = [...icons, newIcon];
        setIcons(updatedIcons);
        if (isEditing && onUpdateIcons) {
             onUpdateIcons(pageNumber, updatedIcons);
        }
        onIconPlaced?.();
    }
  };

  const handleIconClick = (event: React.MouseEvent<HTMLDivElement>, iconId: number) => {
     event.stopPropagation();
    if (isEditing) {
      const updatedIcons = icons.filter(icon => icon.id !== iconId);
      setIcons(updatedIcons);
       if (isEditing && onUpdateIcons) {
             onUpdateIcons(pageNumber, updatedIcons);
       }
    }
  };

  const canPlaceIcon = isEditing && Boolean(selectedIcon);

  return (
    <Page ref={ref}>
      {canPlaceIcon && !isTextEditingOverlayActive && (
        <ClickableOverlay onClick={handleOverlayClick} $canPlaceIcon={true} />
      )}

      <RecipeText $isTextBeingEditedOverlay={isTextEditingOverlayActive}>
        {textToDisplay}
      </RecipeText>

      {icons.map((icon) => (
        <IconContainer
          key={icon.id}
          style={{
              left: `calc(${icon.xPercent}% + 40px)`,
              top: `calc(${icon.yPercent}% + 40px)`
          }}
          onClick={(e) => handleIconClick(e, icon.id)}
          title={isEditing ? "Silmek için tıkla" : ""}
          $isEditing={isEditing}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <IconImage src={icon.src} alt="Recipe icon" />
        </IconContainer>
      ))}
    </Page>
  );
});

RecipePage.displayName = 'RecipePage';
export default RecipePage;