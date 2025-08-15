import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define specific modal types and their data structures
export type ModalType = 
  | 'create-package'
  | 'create-portfolio'
  | 'kyc-form'
  | 'image-upload'
  | 'profile-edit'
  | 'package-edit'
  | 'portfolio-edit'
  | 'creator-details'
  | 'cart'
  | 'chat'
  | 'payment'
  | 'success'
  | 'error'
  | 'confirm'
  | 'info';

// Union type for modal data
export type ModalData = 
  | { type: 'create-package'; data?: never }
  | { type: 'create-portfolio'; data?: never }
  | { type: 'kyc-form'; data?: never }
  | { type: 'image-upload'; data?: { uploadType: 'profile' | 'cover' } }
  | { type: 'profile-edit'; data?: never }
  | { type: 'package-edit'; data?: { packageId: string } }
  | { type: 'portfolio-edit'; data?: { itemId: string } }
  | { type: 'creator-details'; data?: { creatorId: string } }
  | { type: 'cart'; data?: never }
  | { type: 'chat'; data?: { recipientId: string; recipientName: string } }
  | { type: 'payment'; data?: { amount: number; description: string } }
  | { type: 'success'; data?: { message: string; title?: string } }
  | { type: 'error'; data?: { message: string; title?: string } }
  | { type: 'confirm'; data?: { message: string; onConfirm: () => void; title?: string } }
  | { type: 'info'; data?: { message: string; title?: string } };

interface ModalState {
  isOpen: boolean;
  type: ModalType | null;
  data: ModalData['data'] | null;
}

const initialState: ModalState = {
  isOpen: false,
  type: null,
  data: null,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<ModalData>) => {
      state.isOpen = true;
      state.type = action.payload.type;
      state.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.type = null;
      state.data = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;

export default modalSlice.reducer; 