const Loader: React.FC = () => {
    return (
        <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Generating campaign...
        </div>
    );
};

export default Loader;