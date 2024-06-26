import { useContext, useEffect, useRef, useState } from 'react'
import { PiInfo, PiPencilSimpleLineBold } from 'react-icons/pi'
import { twMerge } from 'tailwind-merge'
import { UserContext } from '../../context/UserContext'
import { uploadToCloudinary } from '../../utils/Cloundinary'
import { useToast } from '../../hook/useToast'
import axios from 'axios'
import { UserDetailsProps } from '../../types/user'
import { Button } from '../../components'
import { motion } from 'framer-motion'

const initUserDetails = {
	id: 0,
	name: '',
	avatar: '',
	email: '',
	role: '',
	dateOfBirth: '',
}

const initPwd = {
	current: '',
	new: '',
	confirm: '',
}

const MyAccount: React.FC<{ className?: string }> = ({ className }) => {
	const [imgHover, setImgHover] = useState(false)
	const imgRef = useRef<HTMLInputElement>(null)
	const { user, setUser } = useContext(UserContext)
	const [userDetails, setUserDetails] =
		useState<UserDetailsProps>(initUserDetails)
	const [imgFile, setImgFile] = useState<File>()
	const toast = useToast()
	const handleChangeAvatar = async () => {
		if (!imgFile) return
		toast.info('Uploading', 'Please wait while we upload your avatar...')
		const avatar = await uploadToCloudinary(imgFile)
		toast.success('Success', 'Avatar updated successfully')
		setUser({ ...user, avatar })
	}

	useEffect(() => {
		handleChangeAvatar()
	}, [imgFile])

	const getUserDetails = async () => {
		try {
			const response = await axios.get(`/api/user/details-${user?.id}.json`)
			setUserDetails(response.data.data)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		getUserDetails()
	}, [])

	const [editInfo, setEditInfo] = useState(false)
	const [changePwd, setChangePwd] = useState(false)
	const [passwords, setPasswords] = useState(initPwd)

	const handleEditInfo = () => {
		if (editInfo) {
			setEditInfo(false)
			toast.success('Success', 'Information updated successfully')
		} else {
			setEditInfo(true)
		}
	}

	const handleOpenChangePwd = () => {
		if (changePwd) {
			setChangePwd(false)
			setPasswords(initPwd)
		} else {
			setChangePwd(true)
		}
	}

	const handleChangePwd = () => {
		if (!passwords.current || !passwords.new || !passwords.confirm) {
			toast.error('Error', 'Please fill in all fields')
			return
		}
		if (
			passwords.current.length < 6 ||
			passwords.new.length < 6 ||
			passwords.confirm.length < 6
		) {
			toast.error('Error', 'Password must be at least 6 characters')
			return
		}
		if (passwords.new !== passwords.confirm) {
			toast.error('Error', 'New password and confirm password do not match')
			return
		}
		toast.success('Success', 'Password updated successfully')
		setChangePwd(false)
		setPasswords(initPwd)
	}

	return (
		<motion.div
			className={twMerge('w-full px-8 py-5', className)}
			transition={{
				layout: { duration: 0.2 },
			}}
			layout
		>
			<h3 className=" mb-4 text-2xl font-semibold">General Information</h3>
			<div className="flex items-center gap-2 text-txtCol-3">
				<PiInfo />
				<p className="text-sm">You can edit your personal information here.</p>
			</div>
			<div className="my-4 h-[1px] w-full bg-borderCol-1"></div>
			<div className="relative mb-3">
				<h4 className="mb-2 text-[18px] font-semibold">Profile photo</h4>
				<div
					className="relative h-16 w-16 cursor-pointer select-none overflow-hidden rounded-full border border-borderCol-1"
					onMouseEnter={() => setImgHover(true)}
					onMouseLeave={() => setImgHover(false)}
					onClick={() => {
						if (editInfo) imgRef.current?.click()
					}}
				>
					<input
						className="hidden"
						type="file"
						accept="image/*"
						onChange={(e) => {
							setImgFile(e.target.files?.[0])
						}}
						ref={imgRef}
					/>
					<img
						className="object-cover"
						src={userDetails.avatar}
						alt="user-avatar"
					/>
					<div
						className={`absolute left-0 top-0 flex h-full w-full translate-y-[-0.5px] items-center justify-center  bg-[#00000050] text-xl ${imgHover && editInfo ? 'opacity-100' : 'opacity-0'}`}
					>
						<PiPencilSimpleLineBold className="text-white" />
					</div>
				</div>
				<Button
					className="absolute right-0 top-0 h-9 w-[120px] bg-primary-2 text-white hover:bg-primary-1"
					onClick={handleEditInfo}
				>
					{editInfo ? 'Save' : 'Edit'}
				</Button>
			</div>
			<div className="mt-1 flex w-full gap-8">
				<div className="w-full">
					<h4 className="mb-2 text-[18px] font-semibold">Full name</h4>
					<input
						className="h-11 w-full border-2 border-borderCol-1 px-4 focus:border-2 disabled:bg-gray-100 disabled:text-txtCol-2"
						type="text"
						value={userDetails?.name}
						onChange={(e) =>
							setUserDetails({ ...userDetails, name: e.target.value })
						}
						disabled={!editInfo}
						maxLength={200}
					/>
				</div>
				<div className="w-[200px]">
					<h4 className="mb-2 text-[18px] font-semibold">Date of birth</h4>
					<input
						className="h-11 w-[200px] border-2 border-borderCol-1 px-4 font-semibold focus:border-2 disabled:bg-gray-100 disabled:text-txtCol-2"
						type="date"
						value={userDetails?.dateOfBirth}
						onChange={(e) => {
							setUserDetails({ ...userDetails, dateOfBirth: e.target.value })
						}}
						disabled={!editInfo}
					/>
				</div>
			</div>
			<div className="mt-3 w-full">
				<h4 className="mb-2 text-[18px] font-semibold">Email</h4>
				<input
					className="h-11 w-full border-2 border-borderCol-1 px-4 font-semibold focus:border-2 disabled:bg-gray-100 disabled:text-txtCol-2"
					type="text"
					value={userDetails?.email}
					onChange={(e) =>
						setUserDetails({ ...userDetails, email: e.target.value })
					}
					disabled={!editInfo}
					maxLength={200}
				/>
			</div>
			<h3 className="mb-4 mt-8 text-2xl font-semibold">Account Security</h3>
			{changePwd && (
				<motion.div
					className="flex w-full gap-5"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<div className="w-full">
						<h4 className="mb-2 font-semibold">Current password</h4>
						<input
							className="h-11 w-full border-2 border-borderCol-1 px-4 font-semibold focus:border-2 disabled:bg-gray-100 disabled:text-txtCol-2"
							type="password"
							value={passwords?.current}
							onChange={(e) => {
								setPasswords({ ...passwords, current: e.target.value })
							}}
						/>
					</div>
					<div className="w-full">
						<h4 className="mb-2 font-semibold">New password</h4>
						<input
							className="h-11 w-full border-2 border-borderCol-1 px-4 font-semibold focus:border-2 disabled:bg-gray-100 disabled:text-txtCol-2"
							type="password"
							value={passwords?.new}
							onChange={(e) => {
								setPasswords({ ...passwords, new: e.target.value })
							}}
						/>
					</div>
					<div className="w-full">
						<h4 className="mb-2 font-semibold">Confirm new password</h4>
						<input
							className="h-11 w-full border-2 border-borderCol-1 px-4 font-semibold focus:border-2 disabled:bg-gray-100 disabled:text-txtCol-2"
							type="password"
							value={passwords?.confirm}
							onChange={(e) => {
								setPasswords({ ...passwords, confirm: e.target.value })
							}}
						/>
					</div>
				</motion.div>
			)}
			<div className="mb-2 mt-4 flex w-full justify-between gap-6">
				<Button
					className={`h-9 w-[160px] border-2 transition-all ${changePwd ? 'border-tertiary-1 text-tertiary-1 hover:bg-[#e75b5110]' : 'border-primary-1 text-primary-1 hover:bg-[#2898c815]'}`}
					onClick={handleOpenChangePwd}
				>
					{changePwd ? 'Cancel' : 'Change password'}
				</Button>
				{changePwd && (
					<Button
						className="h-9 w-[160px] bg-secondary-2 text-white transition-all hover:bg-secondary-1"
						onClick={handleChangePwd}
					>
						Save
					</Button>
				)}
			</div>
		</motion.div>
	)
}

export default MyAccount
