// app/hooks/useClickOutside.ts
import { useEffect, RefObject } from 'react';

/**
 * Hook để phát hiện click bên ngoài một hoặc nhiều phần tử DOM được chỉ định.
 *
 * @param ref Ref của phần tử chính (dropdown) mà bạn muốn phát hiện click bên ngoài.
 * @param handler Hàm callback sẽ được gọi khi click bên ngoài phần tử chính.
 * @param excludedRefs Mảng các Ref của các phần tử (ví dụ: nút mở dropdown) mà click vào đó không nên đóng dropdown.
 */
function useClickOutside(
    // KIỂM TRA ĐÂY: ref chính của dropdown, có thể là null
    ref: RefObject<HTMLElement | null>,
    handler: (event: MouseEvent | TouchEvent) => void,
    // KIỂM TRA ĐÂY: mảng các refs ngoại trừ, các ref này cũng có thể là null
    excludedRefs: RefObject<HTMLElement | null>[] = []
) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;

            // Nếu click bên trong ref chính, không làm gì cả
            if (ref.current && ref.current.contains(target)) {
                return;
            }

            // Nếu click bên trong bất kỳ ref nào trong danh sách loại trừ, không làm gì cả
            for (const excludedRef of excludedRefs) {
                if (excludedRef.current && excludedRef.current.contains(target)) {
                    return;
                }
            }

            // Nếu click bên ngoài tất cả các ref được theo dõi, gọi handler
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, excludedRefs]);
}

export default useClickOutside;