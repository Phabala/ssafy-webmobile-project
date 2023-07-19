package com.mmt.common.exception;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.mmt.domain.response.ResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

// 403 Fobidden Exception 처리를 위한 클래스
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    private final Logger LOGGER = LoggerFactory.getLogger(JwtAccessDeniedHandler.class);

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        PrintWriter writer = response.getWriter();
        ErrorCode errorCode = CommonErrorCode.FORBIDDEN;
//        ResponseDto responseDto = ResponseDto.builder()
//                .status(errorCode.getResultCode())
//                .message(errorCode.getResultMessage()).build();
        try{
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
//            writer.write(CmmnVar.GSON.toJson(responseVo));
        }catch(NullPointerException e){
            LOGGER.error("응답 메시지 작성 에러", e);
        }finally{
            if(writer != null) {
                writer.flush();
                writer.close();
            }
        }
//        response.getWriter().write(CmmnVar.GSON.toJson(responseVo));
    }
}
