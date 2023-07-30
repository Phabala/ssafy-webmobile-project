import { configureStore } from '@reduxjs/toolkit'
import authReducer from './store/auth/auth'
import apiReducer from './store/apiUrl/apiUrl'
import lessonReducer from './store/lesson/lesson'
import videoReducer from './store/video/video'
import screenShareReducer from './store/video/screenShare'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    api: apiReducer,
    lesson: lessonReducer,
    video: videoReducer,
    screenShare: screenShareReducer
  },
})