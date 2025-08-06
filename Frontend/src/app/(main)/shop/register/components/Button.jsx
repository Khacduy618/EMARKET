export default function Button({ children, type = 'button', className = '', ...props }) {
    return (
        <button
            type={type}
            className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:shadow-outline ${className}`}
            {...props}
        >
            {children}
        </button>
    );
  }