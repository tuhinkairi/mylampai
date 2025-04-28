import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store'; // Adjust the path to your store file

interface SortState {
    sortBy: 'Default' | 'Completed' | 'Pending';
}

const initialState: SortState = {
    sortBy: 'Default', 
};

const sortReducer = createSlice({
    name: 'sort',
    initialState,
    reducers: {
        setSortBy(state, action: PayloadAction<SortState['sortBy']>) {
            state.sortBy = action.payload;
        },
    },
});

export const { setSortBy } = sortReducer.actions;

// Selector to retrieve the sortBy value
export const selectSortBy = (state: RootState) => state.jobStateSort.sortBy;

export default sortReducer;