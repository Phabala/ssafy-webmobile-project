import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLessonStepList, setStepValid } from '../../store/lesson/lesson';
function LessonStep() {
  const dispatch = useDispatch();
  const [stepList, setStepList] = useState([{ stepOrder: 1, stepContent: '' }]);

  const [errMsg, setErrMsg] = useState('');
  const stepValid = useSelector((state) => state.lesson.stepValid);

  const handleChange = (index, value) => {
    const updatedList = [...stepList];
    updatedList[index] = { ...updatedList[index], stepContent: value };
    setStepList(updatedList);
  };

  const handleAddInput = () => {
    if (stepList[stepList.length - 1].stepContent.trim() === '') {
      setErrMsg('마지막 단계를 채워주세요.');
      return;
    }
    setStepList((prevList) => [
      ...prevList,
      {
        stepContent: '',
      },
    ]);
    setErrMsg('');
  };
  const handleRemoveInput = (index) => {
    if (stepList.length > 1) {
      setStepList((prevList) => {
        const updatedList = prevList
          .filter((_, i) => i !== index)
          .map((step, i) => ({
            ...step,
            stepOrder: i + 1,
          }));
        return updatedList;
      });
    }
  };
  const checkStepContentFilled = useCallback(() => {
    return stepList.every((step) => step.stepContent.trim() !== '');
  }, [stepList]); // 의존성 배열에 stepList 추가

  useEffect(() => {
    dispatch(setLessonStepList(stepList));
    dispatch(setStepValid(checkStepContentFilled()));
  }, [dispatch, stepList, checkStepContentFilled]);

  return (
    <div>
      <div className="lessonInfoDescContainer">
        <div className="lessonInfoMate">진행 단계 <span className="required">*</span></div>
        {/* <div>{stepValid ? '✅' : '🔲'}</div> */}
        <div className='stepInputContainer'>
          {stepList.map((step, index) => (
            <div key={index} className="stepInputWrapper">
              <input
                className='lessonInfoInput'
                type="text"
                value={step.stepContent}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={`요리 진행 단계를 입력하세요`}
              />
              {stepList.length > 1 && (
                <button className='stepCancelButton' onClick={() => handleRemoveInput(index)}>
                  삭제
                </button>
              )}
            </div>
          ))}
          <button className='stepPlusButton' onClick={handleAddInput}>
            +
          </button>
          {errMsg && <p className='stepMsg'>{errMsg}</p>}
          <p className='stepMsg'>
            {checkStepContentFilled() ? '' : '단계를 모두 입력해주세요.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LessonStep;