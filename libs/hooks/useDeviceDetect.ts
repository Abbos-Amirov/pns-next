import { useEffect, useState } from 'react';

const useDeviceDetect = (): string => {
	const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		if (typeof window !== 'undefined') {
			const userAgent = navigator.userAgent;
			const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
			setDevice(isMobile ? 'mobile' : 'desktop');
		}
	}, []);

	// Server-side rendering uchun default desktop qaytaradi
	if (!mounted) {
		return 'desktop';
	}

	return device;
};

export default useDeviceDetect;
