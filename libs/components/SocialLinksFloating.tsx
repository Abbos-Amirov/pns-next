'use client';

import React from 'react';

const PNS_MAIN_URL = 'https://www.pnswindow.co.kr/html/00_main/';
const NAVER_BLOG_URL = 'https://blog.naver.com/pnshomes';
const YOUTUBE_URL = 'https://www.youtube.com/@pnswindow';
const KAKAOTALK_URL =
  'https://accounts.kakao.com/login/?continue=https%3A%2F%2Fpf.kakao.com%2F_gvlGG%2Fchat%3Fapi_ver%3D1.1%26kakao_agent%3Dsdk%252F2.5.0%2520os%252Fjavascript%2520sdk_type%252Fjavascript%2520lang%252Fko-KR%2520device%252FMacIntel%2520origin%252Fhttps%25253A%25252F%25252Fwww.pnswindow.co.kr%26app_key%3Df34b1ee4e3e3fd04ef97563bcb8868a6%26referer%3Dhttps%253A%252F%252Fwww.pnswindow.co.kr%252Fhtml%252F01_product%252Fp_order.php#login';
const NAVER_CAFE_URL = 'https://cafe.naver.com/pcarpenter';

/** PNS logo - white P (clean sans-serif, rounded bowl) */
function PnsLogoIconSvg() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path
        fill="#ffffff"
        fillRule="evenodd"
        d="M8 4h2.8c2 0 3.5 1.4 3.5 3.2 0 1.2-.4 2.1-1 2.7-.7.6-1.5.9-2.5.9H9.5v5.2H8V4zm1.5 5.2h1.2c.8 0 1.3-.5 1.3-1.2 0-.7-.5-1.2-1.3-1.2H9.5v2.4z"
      />
    </svg>
  );
}

/** YouTube icon */
function YouTubeIconSvg() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path
        fill="#ffffff"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>
  );
}

/** KakaoTalk icon */
function KakaoIconSvg() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path
        fill="#ffffff"
        d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.328-1.21-.158-1.038-.691l.892-3.678c-2.88-1.46-4.727-3.99-4.727-6.588C1.5 6.665 6.201 3 12 3z"
      />
    </svg>
  );
}

/** Naver icon */
function NaverIconSvg() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path fill="#ffffff" d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
    </svg>
  );
}

/** Floating social links - right side, stacked vertically above "I am PNS AI" */
export default function SocialLinksFloating() {
  return (
    <div className="social-links-floating">
      <a
        href={NAVER_BLOG_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="social-floating-btn social-floating-blog social-floating-blog-text"
        aria-label="Naver Blog"
      >
        Blog
      </a>
      <a
        href={PNS_MAIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="social-floating-btn social-floating-pns"
        aria-label="PNS Window"
      >
        <PnsLogoIconSvg />
      </a>
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="social-floating-btn social-floating-youtube"
        aria-label="YouTube"
      >
        <YouTubeIconSvg />
      </a>
      <a
        href={KAKAOTALK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="social-floating-btn social-floating-kakao"
        aria-label="KakaoTalk"
      >
        <KakaoIconSvg />
      </a>
      <a
        href={NAVER_CAFE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="social-floating-btn social-floating-naver"
        aria-label="Naver Cafe"
      >
        <NaverIconSvg />
      </a>
    </div>
  );
}
