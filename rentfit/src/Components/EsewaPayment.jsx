import React, { useEffect, useRef } from "react";

const EsewaPayment = ({ data }) => {
    const formRef = useRef();

    useEffect(() => {
        if (data && formRef.current) {
            formRef.current.submit();
        }
    }, [data]);

    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold text-gray-800">Redirecting to eSewa...</p>
            <p className="text-gray-500 mt-2">Please do not refresh the page.</p>

            <form ref={formRef} action={data.payment_url} method="POST" className="hidden">
                {Object.entries(data).map(([key, value]) =>
                    key !== "payment_url" && (
                        <input key={key} type="hidden" name={key} value={value} />
                    )
                )}
            </form>
        </div>
    );
};

export default EsewaPayment;
