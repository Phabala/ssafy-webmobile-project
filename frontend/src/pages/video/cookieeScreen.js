import React, { useEffect, useState } from 'react';
import VideoHeader from '../../component/Video/VideoHeader';
import UserVideoComponent from '../../component/Video/UserVideoComponent';
import Timer from '../../component/Video/Timer';
import CookieeLessonStep from '../../component/Video/Cookiee/CookieeLessonStep';
import CookieeVideoSideBar from '../../component/Video/Cookiee/CookieeVideoSideBar';

import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { deleteSubscriber, enteredSubscriber, leaveSession, setAudioMute } from '../../store/video/video';
import { joinSession } from '../../store/video/video-thunk';
import { initCookieeVideo, resetCheck, resetHandsUp } from '../../store/video/cookieeVideo';
import { setCurStep, setLessonInfo, setStepInfo } from '../../store/video/videoLessonInfo';
import '../../style/video.css'
import { initScreenShare } from '../../store/video/screenShare';
import LessonReviewModal from '../../component/Video/Cookiee/LessonReviewModal';

import { AiFillCheckCircle } from 'react-icons/ai'
import { IoIosHand } from 'react-icons/io'

function CookieeScreen() {
  const dispatch = useDispatch()
  
  const OV = useSelector((state) => state.video.OV)
  const session = useSelector((state) => state.video.session)
  const publisher = useSelector((state) => state.video.publisher)
  const subscribers = useSelector((state) => state.video.subscribers)
  // 항상 쿠커가 먼저 들어와있기 때문에 이 로직도 괜찮을 것 같지만, subscribers가 있을때만 실행되는 것으로 변경
  // const cookyerStream = subscribers.find((sub) => (
  //   JSON.parse(sub.stream.connection.data).clientData.role === 'cookyer'
  // ))

  const sessionId = useSelector((state) => state.video.sessionId)
  const nickname = localStorage.getItem('nickname');
  const role = localStorage.getItem('role')

  /** 레슨 정보 */
  const access_token = localStorage.getItem('access_token')
  const videoLessonId = useSelector((state) => state.video.videoLessonId)
  // const [ myLesson, setMyLesson ] = useState(undefined)  // 학생 모달창에 불러서 쓸 레슨 정보

  const [ isCompleted, setIsCompleted ] = useState(false)

  /** 체크 기능 */
  const check = useSelector((state) => state.cookieeVideo.check)

  /** 손들기 기능 */
  const handsUp = useSelector((state) => state.cookieeVideo.handsUp)

  /** 선생님 화면 고정하기 위해 선생님 subscriber 찾기 */
  const [ cookyerStream, setCookyerStream ] = useState(undefined)

  /** 자동 전체 화면 */
  useEffect(() => {
    const element = document.documentElement; // 전체 화면으로 변경하고자 하는 요소
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }, []);

  useEffect(() => {
    if (subscribers) {
      console.log(subscribers)
      const cookyer = subscribers.find((sub) => (
        JSON.parse(sub.stream.connection.data).clientData.role === 'COOKYER'
      ))
      setCookyerStream(cookyer)
    }
  }, [subscribers, cookyerStream])

  useEffect(() => {
    console.log(3, session)
    if (session) {
      // On every new Stream received...
      const handleStreamCreated = (event) => {
        const subscriber = session.subscribe(event.stream, undefined);
        dispatch(enteredSubscriber(subscriber))
      };

      // On every Stream destroyed...
      const handleStreamDestroyed = (event) => {
        dispatch(deleteSubscriber(event.stream.streamManager))
      };

      // On every asynchronous exception...
      const handleException = (exception) => {
        console.warn(exception);
      };

      session.on('streamCreated', handleStreamCreated);
      session.on('streamDestroyed', handleStreamDestroyed);
      session.on('exception', handleException);

      /** 쿠커가 수업을 종료하면 스토어에 저장된 관련 정보 초기화 후 리뷰쓰러 */
      // session.off('sessionDisconnected', () => {
      session.on('sessionDisconnected', () => {
        dispatch(leaveSession())
        dispatch(initCookieeVideo())
        dispatch(initScreenShare())
        setIsCompleted(true)
        // 쿠커가 수업 종료와 함께 모든 쿠키들을 페이지 이동 시키려면 이곳에서 하면 됨
      })

      /** 쿠커로부터 체크 리셋 시그널 받고 체크 해제 */
      session.on('signal:resetCheck', () => {
        console.log("체크 리셋 시그널")
        dispatch(resetCheck())
      })

      /** 쿠커로부터 손들기 리셋 시그널 받고 손들기 해제 */
      // 쿠커가 특정 쿠키에게만 신호를 보내도록 설정해줘야 함!!!!
      session.on('signal:resetHandsUp', () => {
        console.log("손들기 리셋 시그널")
        dispatch(resetHandsUp())
      })

      /** 쿠커로부터 진행단계 변화 시그널 받고 진행단계 바꾸기 */
      session.on('signal:changeStep', (e) => {
        console.log("진행단계 시그널", e.data)
        const data = JSON.parse(e.data)
        console.log(data)
        if (data !== undefined) {
          dispatch(setStepInfo(data))
        }
      })

      /** 쿠커로부터 음소거 시그널 받고 음소거하기 */
      session.on('signal:forceAudioMute', () => {
        console.log("음소거 시그널")
        dispatch(setAudioMute())
      })

      /** 화면공유 받기 */
      // session.on('signal:sharedScreen', (e) => {
      //   console.log("화면공유 데이터 받았다", e)  // 시그널 받는거 필요하지 않을수도?
      // })

      console.log(4)

      /** 페이지 입장 후 세션에 연결 및 발행하기 */
      const data = {
        OV,
        session,
        sessionId,
        nickname,
        role
      }
      dispatch(joinSession(data))
      // dispatch(publishStream({data}))


      console.log(5)

      // Clean-up 함수 등록
      return () => {
        session.off('streamCreated', handleStreamCreated);
        session.off('streamDestroyed', handleStreamDestroyed);
        session.off('exception', handleException);
        const mySession = session;
        if (mySession) {
          mySession.disconnect(); // 예시에서는 disconnect()로 대체하였으나, 이는 OpenVidu에 따라 다르게 적용될 수 있음
        }
      };
    }
  }, []);

  useEffect(() => {
    if (videoLessonId) {
      axios.get(
        `/api/v1/lesson/${videoLessonId}`,
        {
          headers : {
            Access_Token : access_token
          }
        })
        .then((res) => {
          console.log(res.data)
          console.log('화상 과외 수업 정보 받아와짐')
          // setMyLesson(res.data) // 토큰이랑 커넥션 설정하는걸로 바꾸기?
          dispatch(setLessonInfo(res.data))
          const firstLessonStep = res.data.lessonStepList.find((step) => step.stepOrder === 1)
          console.log(firstLessonStep.stepContent)
          dispatch(setCurStep(firstLessonStep.stepContent))
        })
        .catch((err) => {
          console.log(err)
          console.log('화상 과외 수업 정보 안받아와짐')
        })
    }
  }, [videoLessonId])

  // const handleMainVideoStream = (stream) => {
  //   if (mainStreamManager !== stream) {
  //     dispatch(setMainStreamManager(stream))
  //   }
  // }

  return (
    <div className='video-page'>
      <CookieeVideoSideBar/>
      <div>
        {isCompleted ? (
          <LessonReviewModal/>
        ) : null}
        <div>
          <VideoHeader/>
          <div className='cookiee-video-content'>
            <div>
              <div className='cookiee-sharing'>
              {/* <div className='cookiee-sharing' onClick={() => handleMainVideoStream(cookyerStream)}> */}
                <div className='cookiee-sharing-content'>
                  {isCompleted ? (
                    <p>수업이 종료되었습니다.</p>
                  ) : (
                    <UserVideoComponent
                      videoStyle='cookiee-sharing-content'
                      streamManager={cookyerStream}
                    />
                  )}
                </div>
              </div>
              <CookieeLessonStep/>
            </div>
            <div>
              {/* 쿠커 화면 */}
              <div className='cookiee-content'>
                {cookyerStream ? (
                  <UserVideoComponent
                    videoStyle='cookiee-content-video'
                    streamManager={cookyerStream}
                  />
                ) : (
                  <h1>쿠커 화면</h1>
                )}
              </div>
              <Timer role='COOKIEE'/>
              {/* 쿠키 본인 화면 */}
              <div className='cookiee-content'>
                {publisher !== undefined ? (
                  <UserVideoComponent
                    videoStyle='cookiee-content-video'
                    streamManager={publisher}
                  />
                ) : (
                  <h1>쿠키 화면</h1>
                )}
                {check ? (
                  <AiFillCheckCircle className='cookiee-check-icon-active'/>
                ) : (
                  <AiFillCheckCircle className='cookiee-check-icon'/>
                )}
                {handsUp ? (
                  <IoIosHand className='cookiee-handsup-icon-active'/>
                ) : (
                  <IoIosHand className='cookiee-handsup-icon'/>
                )}
              </div>

              {/* <div className='cookyer-cookiees'> */}
                {/* {subscribers} */}
                {/* {subscribers ? (
                  subscribers.map((sub, i) => (
                    <div key={i}>
                      <UserVideoComponent
                        videoStyle='cookyer-cookiee'
                        streamManager={sub}
                      />
                    </div>
                  ))
                ) : null} */}
              {/* </div> */}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieeScreen;