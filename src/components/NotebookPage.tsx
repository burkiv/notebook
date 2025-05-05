import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const NotebookContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
`;

const Book = styled(motion.div)`
  display: flex;
  width: 1400px;
  height: 800px;
  position: relative;
  transform-style: preserve-3d;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 10px rgba(0,0,0,0.1) inset;
`;

const Page = styled(motion.div)<{ isLeftPage?: boolean }>`
  background: linear-gradient(to right, #f5f5f5 0%, white 3%, white 97%, #f5f5f5 100%);
  width: 700px;
  height: 100%;
  padding: 40px;
  position: relative;
  box-shadow: ${props => props.isLeftPage
    ? '2px 0 5px rgba(0,0,0,0.1)'
    : '-2px 0 5px rgba(0,0,0,0.1)'};
  background-image:
    linear-gradient(#e0e0e0 1px, transparent 1px),
    linear-gradient(90deg, #e0e0e0 1px, transparent 1px);
  background-size: 25px 25px;
  overflow: hidden;
`;

const ClickableOverlay = styled.div<{ $canPlaceIcon?: boolean }>`
  position: absolute;
  inset: 0;
  z-index: ${props => props.$canPlaceIcon ? 10 : 0};
  pointer-events: ${props => props.$canPlaceIcon ? 'auto' : 'none'};
  cursor: ${props => props.$canPlaceIcon ? 'copy' : 'default'};
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

const RecipeText = styled(TextBase)`
  z-index: 2;
`;

const EditableText = styled.textarea<{ $canPlaceIcon?: boolean }>`
  position: absolute;
  inset: 40px;
  padding: 20px;
  width: calc(100% - 80px - 40px);
  height: calc(100% - 80px - 40px);
  background: transparent;
  border: none;
  font-family: 'Architects Daughter', cursive;
  font-size: 1.2em;
  color: #444;
  line-height: 1.6;
  resize: none;
  outline: none;
  z-index: 3;
  pointer-events: ${props => props.$canPlaceIcon ? 'none' : 'auto'};

  &::placeholder {
    color: #999;
  }
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

const Binding = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 40px;
  transform: translateX(-50%);
  background: linear-gradient(to right,
    #c0c0c0 0%,
    #e0e0e0 20%,
    #c0c0c0 40%,
    #909090 50%,
    #c0c0c0 60%,
    #e0e0e0 80%,
    #c0c0c0 100%
  );
  border-radius: 3px;
  box-shadow: 
    inset -3px 0 6px rgba(0,0,0,0.2),
    inset 3px 0 6px rgba(0,0,0,0.2);
  z-index: 1;
`;

export interface DroppedIcon {
  id: number;
  src: string;
  xPercent: number;
  yPercent: number;
  page: 'left' | 'right';
}

export interface RecipeData {
  id: number;
  title?: string;
  leftPageText: string;
  rightPageText: string;
  icons: DroppedIcon[];
}

interface NotebookPageProps {
  isEditing?: boolean;
  selectedIcon?: string | null;
  onIconPlaced?: () => void;
  initialData?: RecipeData | null;
  onUpdate?: (updatedData: Partial<RecipeData>) => void;
}

const pageVariants = {
  initial: (direction: number) => ({
    rotateY: direction > 0 ? -180 : 180,
    opacity: 0,
    transition: { duration: 0.1 }
  }),
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? 180 : -180,
    opacity: 0,
    transition: { duration: 0.6, ease: "easeIn" }
  })
};

const NotebookPage: React.FC<NotebookPageProps> = ({
  isEditing = false,
  selectedIcon,
  onIconPlaced,
  initialData = null,
  onUpdate
}) => {
  const [icons, setIcons] = useState<DroppedIcon[]>([]);
  const [leftPageText, setLeftPageText] = useState('');
  const [rightPageText, setRightPageText] = useState('');

  useEffect(() => {
    setLeftPageText(initialData?.leftPageText || '');
    setRightPageText(initialData?.rightPageText || '');
    setIcons(initialData?.icons || []);
  }, [initialData]);

  const handleLeftTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLeftPageText(newText);
    if (isEditing && onUpdate) {
      onUpdate({ leftPageText: newText });
    }
  };

  const handleRightTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setRightPageText(newText);
    if (isEditing && onUpdate) {
      onUpdate({ rightPageText: newText });
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>, page: 'left' | 'right') => {
    if (isEditing && selectedIcon) {
        const overlay = event.currentTarget;
        const rect = overlay.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        const xPercent = (clickX / rect.width) * 100;
        const yPercent = (clickY / rect.height) * 100;

        console.log(`Overlay Click on ${page} page at: x%=${xPercent}, y%=${yPercent}`);

        const newIcon: DroppedIcon = {
            id: Date.now(),
            src: selectedIcon,
            xPercent: xPercent,
            yPercent: yPercent,
            page
        };
        const updatedIcons = [...icons, newIcon];
        setIcons(updatedIcons);
        if (isEditing && onUpdate) {
             onUpdate({ icons: updatedIcons });
        }
        onIconPlaced?.();
    }
  };

  const handleIconClick = (event: React.MouseEvent<HTMLDivElement>, iconId: number) => {
    event.stopPropagation();
    if (isEditing) {
      const updatedIcons = icons.filter(icon => icon.id !== iconId);
      setIcons(updatedIcons);
      if (isEditing && onUpdate) {
        onUpdate({ icons: updatedIcons });
      }
    }
  };

  const canPlaceIcon = isEditing && Boolean(selectedIcon);

  return (
    <NotebookContainer>
      <AnimatePresence initial={false} custom={1}>
        <Book
          key={initialData?.id ?? 'new-recipe'}
          custom={1}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Page isLeftPage>
            <ClickableOverlay
              onClick={(e) => handleOverlayClick(e, 'left')}
              $canPlaceIcon={canPlaceIcon}
            />
            {isEditing ? (
              <EditableText
                value={leftPageText}
                onChange={handleLeftTextChange}
                placeholder="Başlık ve Malzemeler..."
                spellCheck={false}
                $canPlaceIcon={canPlaceIcon}
              />
            ) : (
              <RecipeText>{leftPageText}</RecipeText>
            )}
            {icons.filter(icon => icon.page === 'left').map((icon) => (
              <IconContainer
                key={icon.id}
                style={{
                    left: `${icon.xPercent}%`,
                    top: `${icon.yPercent}%`
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
          <Binding />
          <Page>
            <ClickableOverlay
              onClick={(e) => handleOverlayClick(e, 'right')}
              $canPlaceIcon={canPlaceIcon}
            />
            {isEditing ? (
              <EditableText
                value={rightPageText}
                onChange={handleRightTextChange}
                placeholder="Hazırlanışı..."
                spellCheck={false}
                $canPlaceIcon={canPlaceIcon}
              />
            ) : (
              <RecipeText>{rightPageText}</RecipeText>
            )}
            {icons.filter(icon => icon.page === 'right').map((icon) => (
              <IconContainer
                key={icon.id}
                style={{
                    left: `${icon.xPercent}%`,
                    top: `${icon.yPercent}%`
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
        </Book>
      </AnimatePresence>
    </NotebookContainer>
  );
};

export default NotebookPage;