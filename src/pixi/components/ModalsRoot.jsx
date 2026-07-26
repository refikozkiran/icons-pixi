import React from 'react';
import { useUI } from '../../state/uiStore.js';
import WinModal from './WinModal.jsx';
import ChestModal from './ChestModal.jsx';
import AchievementModal from './AchievementModal.jsx';
import { HowtoModal, ResetConfirmModal } from './MiscModals.jsx';

export default function ModalsRoot() {
  const modal = useUI(s => s.modal);
  if (!modal) return null;
  switch (modal) {
    case 'win': return <WinModal />;
    case 'chest': return <ChestModal />;
    case 'achv': return <AchievementModal />;
    case 'howto': return <HowtoModal />;
    case 'reset-confirm': return <ResetConfirmModal />;
    default: return null;
  }
}
