/**
 * PRODUCT INDEX - Scroll-Stack Effect
 *
 * QANDAY ISHLAYDI:
 * - CHAP TOMON: Mahsulot rasmlari "stack" (qatlam) qilib joylashgan
 * - O'NG TOMON: Har bir mahsulot haqida ma'lumot (title, description, features)
 *
 * SCROLL EFEKTI (kursorga/scrollga javob beradi):
 * - PASTGA scroll qilsangiz: pastdagi rasmlar pastga tushib, ochilib ketadi (unstack)
 * - TEPAGA scroll qilsangiz: pastdagi rasmlar tepadagi rasmlar ustiga taxlanadi (stack)
 *
 * activeIndex: O'ng tomondagi qaysi section ko'proq ko'rinsa, chap tomonda shu mahsulot rasmi
 * ustida bo'ladi. IntersectionObserver scroll pozitsiyasini kuzatadi.
 */
import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

type ProductDisplay = {
	id: string;
	title: string;
	subtitle: string;
	description: string;
	features: string[];
	image: string;
	price?: number;
};

const ProductIndexPage: NextPage = () => {
	const router = useRouter();
	const [products, setProducts] = useState<ProductDisplay[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeIndex, setActiveIndex] = useState(0);
	const sectionRefs = useRef<(HTMLElement | null)[]>([]);

	// Backenddan mahsulotlarni olish
	useEffect(() => {
		fetch('/api/products', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				input: { page: 1, limit: 12, sort: 'productRank', direction: 'DESC', search: {} },
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				const list = data?.list || [];
				const mapped: ProductDisplay[] = list.map((p: any) => ({
					id: p._id,
					title: p.productTitle || 'Product',
					subtitle: `${p.productType || ''} • ${p.productMaterial || ''}`.trim() || 'Premium quality',
					description: p.productDesc || 'High-quality product with excellent features.',
					features: [
						p.productMaterial && `Material: ${p.productMaterial}`,
						p.productGlassType && `Glass: ${p.productGlassType}`,
						p.productOpenType && `Open type: ${p.productOpenType}`,
						p.productLocation && `Location: ${p.productLocation}`,
					].filter(Boolean),
					image: p.productImages?.[0] ? `/${p.productImages[0]}` : 'https://via.placeholder.com/600x400?text=No+Image',
					price: p.productPrice,
				}));
				setProducts(mapped.length > 0 ? mapped : getFallbackProducts());
			})
			.catch(() => setProducts(getFallbackProducts()))
			.finally(() => setLoading(false));
	}, []);

	// Fallback: agar backend bo'sh bo'lsa
	const getFallbackProducts = (): ProductDisplay[] => [
		{
			id: 'p1',
			title: 'Aluminum Sliding Window',
			subtitle: 'Smooth • Minimal • Modern',
			description: 'High-performance sliding window system with strong insulation and clean lines.',
			features: ['Double glazing', 'Noise reduction', 'Weather sealing', 'Easy maintenance'],
			image: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=80',
		},
		{
			id: 'p2',
			title: 'Tilt & Turn Window',
			subtitle: 'Safe ventilation • Premium seal',
			description: 'Practical system for ventilation and maximum sealing.',
			features: ['Two opening modes', 'Security hardware', 'Energy saving', 'Long durability'],
			image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
		},
		{
			id: 'p3',
			title: 'Modern Entrance Door',
			subtitle: 'Secure • Elegant • Strong',
			description: 'Modern entrance door with premium finish and reinforced structure.',
			features: ['Multi-lock system', 'Thermal insulation', 'Custom colors', 'Premium handle set'],
			image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80',
		},
	];

	// Scroll kuzatuvchi: o'ng tomondagi section qaysi biri ko'proq ko'rinsa, activeIndex shunga o'zgaradi
	useEffect(() => {
		const nodes = sectionRefs.current.filter(Boolean) as HTMLElement[];
		if (nodes.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
				if (visible[0]) {
					const idx = Number((visible[0].target as HTMLElement).dataset.index);
					if (!Number.isNaN(idx)) setActiveIndex(idx);
				}
			},
			{ threshold: [0.35, 0.55, 0.75], rootMargin: '-10% 0px -40% 0px' }
		);
		nodes.forEach((n) => observer.observe(n));
		return () => observer.disconnect();
	}, [products]);

	if (loading) {
		return (
			<div style={styles.page}>
				<div style={styles.loading}>Loading products...</div>
			</div>
		);
	}

	if (products.length === 0) {
		return (
			<div style={styles.page}>
				<div style={styles.loading}>No products found.</div>
			</div>
		);
	}

	return (
		<div id="product-index-page" style={styles.page}>
			<div style={styles.wrapper}>
				{/* CHAP: Sticky stacked images - scroll qilganda taxlanadi/ochiladi */}
				<aside style={styles.left}>
					<div style={styles.stickyBox}>
						<div style={styles.stackFrame}>
							{products.map((p, i) => {
								const diff = i - activeIndex;
								const translateY = diff === 0 ? 0 : diff < 0 ? diff * 18 : diff * 28;
								const scale = diff === 0 ? 1 : diff < 0 ? 1 - Math.min(Math.abs(diff) * 0.04, 0.12) : 1;
								const opacity = diff < -2 ? 0 : diff > 2 ? 0 : diff === 0 ? 1 : 0.9;
								const zIndex = 100 - Math.abs(diff);

								return (
									<div
										key={p.id}
										style={{
											...styles.card,
											transform: `translateY(${translateY}px) scale(${scale})`,
											opacity,
											zIndex,
											filter: diff === 0 ? 'none' : 'brightness(0.95)',
										}}
										aria-hidden={diff !== 0}
									>
										<img src={p.image} alt={p.title} style={styles.image} />
										<div style={styles.cardOverlay}>
											<div style={styles.badge}>{String(i + 1).padStart(2, '0')}</div>
											<div style={styles.cardTitle}>{p.title}</div>
											<div style={styles.cardSub}>{p.subtitle}</div>
										</div>
									</div>
								);
							})}
						</div>
						<div style={styles.dots}>
							{products.map((_, i) => (
								<span
									key={i}
									style={{
										...styles.dot,
										opacity: i === activeIndex ? 1 : 0.35,
										transform: i === activeIndex ? 'scale(1.1)' : 'scale(1)',
									}}
								/>
							))}
						</div>
					</div>
				</aside>

				{/* O'NG: Mahsulot ma'lumotlari - scroll qilganda yangilanadi */}
				<main style={styles.right}>
					{products.map((p, i) => (
						<section
							key={p.id}
							data-index={i}
							ref={(el) => { sectionRefs.current[i] = el; }}
							style={styles.section}
						>
							<div style={styles.kicker}>PRODUCT {String(i + 1).padStart(2, '0')}</div>
							<h2 style={styles.h2}>{p.title}</h2>
							<div style={styles.subtitle}>{p.subtitle}</div>
							<p style={styles.desc}>{p.description}</p>
							{p.price != null && (
								<div style={styles.price}>${p.price.toLocaleString()}</div>
							)}
							{p.features.length > 0 && (
								<div style={styles.featureBox}>
									<div style={styles.featureTitle}>Key Features</div>
									<ul style={styles.ul}>
										{p.features.map((f) => (
											<li key={f} style={styles.li}>{f}</li>
										))}
									</ul>
								</div>
							)}
							<div style={styles.ctaRow}>
								<button
									style={styles.primaryBtn}
									onClick={() => router.push(`/property/detail?id=${p.id}`)}
								>
									View Details
								</button>
							</div>
						</section>
					))}
				</main>
			</div>
		</div>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const styles: Record<string, React.CSSProperties> = {
	page: {
		minHeight: '100vh',
		background: '#0b0c10',
		color: '#fff',
	},
	loading: {
		minHeight: '60vh',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: 18,
		opacity: 0.8,
	},
	wrapper: {
		maxWidth: 1200,
		margin: '0 auto',
		padding: '40px 20px',
		display: 'flex',
		gap: 28,
	},
	left: { flex: '0 0 44%' },
	stickyBox: {
		position: 'sticky',
		top: 24,
		height: 'calc(100vh - 48px)',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
	},
	stackFrame: {
		position: 'relative',
		height: 520,
		borderRadius: 18,
	},
	card: {
		position: 'absolute',
		inset: 0,
		borderRadius: 18,
		overflow: 'hidden',
		boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
		transition: 'transform 450ms ease, opacity 450ms ease, filter 450ms ease',
		background: '#111',
	},
	image: {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		display: 'block',
	},
	cardOverlay: {
		position: 'absolute',
		left: 16,
		right: 16,
		bottom: 16,
		padding: 14,
		borderRadius: 14,
		background: 'rgba(0,0,0,0.45)',
		backdropFilter: 'blur(10px)',
	},
	badge: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: 44,
		height: 28,
		borderRadius: 999,
		background: 'rgba(255,255,255,0.12)',
		fontSize: 12,
		letterSpacing: 1,
		marginBottom: 10,
	},
	cardTitle: { fontSize: 16, fontWeight: 700, lineHeight: 1.2 },
	cardSub: { fontSize: 13, opacity: 0.8, marginTop: 6 },
	dots: {
		marginTop: 14,
		display: 'flex',
		gap: 8,
		justifyContent: 'center',
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 999,
		background: '#fff',
		transition: 'all 250ms ease',
	},
	right: { flex: '1 1 auto' },
	section: {
		minHeight: '100vh',
		padding: '64px 10px',
		borderBottom: '1px solid rgba(255,255,255,0.08)',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
	},
	kicker: { fontSize: 12, opacity: 0.7, letterSpacing: 1.2, marginBottom: 10 },
	h2: { fontSize: 44, margin: 0, lineHeight: 1.05 },
	subtitle: { marginTop: 10, fontSize: 16, opacity: 0.85 },
	desc: { marginTop: 16, fontSize: 16, opacity: 0.82, maxWidth: 560, lineHeight: 1.7 },
	price: { marginTop: 12, fontSize: 24, fontWeight: 700, color: '#c9a962' },
	featureBox: {
		marginTop: 26,
		padding: 18,
		borderRadius: 16,
		background: 'rgba(255,255,255,0.06)',
		border: '1px solid rgba(255,255,255,0.10)',
		maxWidth: 560,
	},
	featureTitle: { fontWeight: 700, marginBottom: 10 },
	ul: { margin: 0, paddingLeft: 18, opacity: 0.9 },
	li: { marginBottom: 8 },
	ctaRow: { marginTop: 22, display: 'flex', gap: 12 },
	primaryBtn: {
		padding: '12px 16px',
		borderRadius: 12,
		border: '1px solid rgba(255,255,255,0.18)',
		background: '#ffffff',
		color: '#0b0c10',
		fontWeight: 700,
		cursor: 'pointer',
	},
};

export default withLayoutBasic(ProductIndexPage);
