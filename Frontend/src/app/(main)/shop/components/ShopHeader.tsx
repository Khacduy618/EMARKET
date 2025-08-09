'use client';

import { useState } from 'react';
import { MapPin, Phone, Star, Users, Heart } from 'lucide-react';
import { getProductDisplayImage } from '@/utils/imageHelpers';

interface Shop {
    ShopID: number;
    ShopName: string;
    ShopDescription?: string;
    ShopPhone?: string;
    ShopEmail?: string;
    ShopAddress?: string;
    ShopLogo?: string;
    ShopCoverImage?: string;
    ShopLevel?: number;
    FollowerCount?: number;
    IsFollowing?: boolean;
}

interface ShopHeaderProps {
    shop: Shop;
}

export default function ShopHeader({ shop }: ShopHeaderProps) {
    const [isFollowing, setIsFollowing] = useState(shop.IsFollowing || false);
    const [followerCount, setFollowerCount] = useState(shop.FollowerCount || 0);

    const handleFollowClick = async () => {
        try {
            // TODO: Implement follow/unfollow API call
            setIsFollowing(!isFollowing);
            setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
        } catch (error) {
            console.error('Error following/unfollowing shop:', error);
        }
    };

    const renderStars = (level: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${
                    index < level ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4 md:mb-6">
            {/* Cover Image */}
            <div className="relative h-32 sm:h-40 md:h-64">
                <img
                    src={getProductDisplayImage({ ImageURL: shop.ShopCoverImage })}
                    alt={`${shop.ShopName} cover`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            {/* Shop Info */}
            <div className="relative px-4 py-4 md:px-6 md:py-6">
                {/* Shop Logo */}
                <div className="absolute -top-8 left-4 md:-top-16 md:left-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 rounded-full border-2 md:border-4 border-white bg-white shadow-lg overflow-hidden">
                        <img
                            src={getProductDisplayImage({ ImageURL: shop.ShopLogo })}
                            alt={`${shop.ShopName} logo`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Follow Button */}
                <div className="flex justify-end mb-2 md:mb-4">
                    <button
                        onClick={handleFollowClick}
                        className={`flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-6 md:py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
                            isFollowing
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                    >
                        <Heart className={`w-3 h-3 md:w-4 md:h-4 ${isFollowing ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{isFollowing ? 'Đang theo dõi' : 'Theo dõi'}</span>
                        <span className="sm:hidden">{isFollowing ? 'Đã theo dõi' : 'Theo dõi'}</span>
                    </button>
                </div>

                {/* Shop Details */}
                <div className="mt-6 sm:mt-8 md:mt-4">
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                        {/* Left Side - Basic Info */}
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {shop.ShopName}
                            </h1>
                            
                            {shop.ShopDescription && (
                                <p className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4 leading-relaxed line-clamp-3 md:line-clamp-none">
                                    {shop.ShopDescription}
                                </p>
                            )}

                            {/* Contact Info */}
                            <div className="space-y-1.5 md:space-y-2">
                                {shop.ShopAddress && (
                                    <div className="flex items-start gap-2 text-gray-600">
                                        <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm line-clamp-2">{shop.ShopAddress}</span>
                                    </div>
                                )}
                                
                                {shop.ShopPhone && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm">{shop.ShopPhone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Stats */}
                        <div className="flex flex-col md:items-end gap-3 md:gap-4">
                            {/* Shop Level */}
                            {shop.ShopLevel && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm text-gray-600">Cấp độ:</span>
                                    <div className="flex items-center gap-0.5">
                                        {renderStars(shop.ShopLevel)}
                                    </div>
                                </div>
                            )}

                            {/* Follower Count */}
                            <div className="flex items-center gap-2 text-gray-600">
                                <Users className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                                <span className="text-xs sm:text-sm">
                                    {followerCount.toLocaleString()} người theo dõi
                                </span>
                            </div>

                            {/* Shop Stats */}
                            <div className="flex gap-4 sm:gap-6 text-center">
                                <div>
                                    <div className="text-sm sm:text-lg font-bold text-gray-900">4.8</div>
                                    <div className="text-xs text-gray-500">Đánh giá</div>
                                </div>
                                <div>
                                    <div className="text-sm sm:text-lg font-bold text-gray-900">98%</div>
                                    <div className="text-xs text-gray-500">Phản hồi</div>
                                </div>
                                <div>
                                    <div className="text-sm sm:text-lg font-bold text-gray-900">2h</div>
                                    <div className="text-xs text-gray-500">Phản hồi</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}