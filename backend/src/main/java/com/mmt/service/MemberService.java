package com.mmt.service;

import com.mmt.domain.request.UserLoginPostReq;
import com.mmt.domain.request.UserSignUpReq;
import com.mmt.domain.response.ResponseDto;

import javax.servlet.http.HttpServletResponse;

public interface MemberService {

    // 회원가입

    public ResponseDto signUp(UserSignUpReq userSignUpReq) throws Exception;
    public ResponseDto login(UserLoginPostReq userLoginPostReq, HttpServletResponse response);
}
