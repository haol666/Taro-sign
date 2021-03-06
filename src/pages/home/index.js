import Taro , { Component } from '@tarojs/taro'
import { View, Text, Image} from '@tarojs/components'
import { AtModal } from "taro-ui"
import { connect } from '@tarojs/redux'
import SaoMiao from '@assets/saomiao.png'
import ShengCheng from '@assets/shengcheng.png'
import util from '@util/util.js'
import {
    dispatchSignRecord,
} from '@actions/home.js'
import './home.sass'


@connect(state => state, {
    dispatchSignRecord,
})
export default class Home extends Component {

    config = {
        navigationBarTitleText: '签到'
    }
    state={
        isOpened: false,
        errorInfo: '',
    }
    componentDidMount () {
    }
    creatCode = () => {
        const { userAuthorized: { isteacher } } = this.props
        if (isteacher == 0) {
            util.showToast('只有老师有该权限哦')
            return
        }
        const goParams = {
            url: '/pages/qrcode/qrcode',
        }
        Taro.navigateTo(goParams).then()
    }
    // 扫码获取到信息以后，调取位置接口，判断位置，然后在签到后台接口
    scanCode = () => {
        const { userAuthorized: { isteacher } } = this.props
        if (isteacher == 1) {
            util.showToast('只有学生有该权限哦')
            return
        }
        const that = this
        const qrParams = {
            success: (res) => {
                const { result } = res
                const { userAuthorized: { username, name } } = this.props
                Taro.getLocation({
                    type: 'gcj02',
                    success(res) {
                        const latitudeGet = res.latitude
                        const longitudeGet = res.longitude
                        const payload = {
                            params: {
                                sid: result,
                                username,
                                name,
                                longitude: longitudeGet,
                                latitude: latitudeGet,
                            },
                            successCb: () => {
                                util.showToast('签到成功', 'success', 2000)
                            },
                            failCb: (e) => {
                                that.setState({
                                    isOpened: true,
                                    errorInfo: e,
                                })
                            }
                        }
                        that.props.dispatchSignRecord(payload)
                    },
                    fail() {
                        util.showToast('获取位置失败')
                    }
                })
            }
        }
        Taro.scanCode(qrParams).then()
    }
    handleConfirm = () => {
        this.setState({
            isOpened: false,
            errorInfo: '',
        })
    }
    render() {
        const { isOpened, errorInfo } = this.state
        return (
            <View className='container'>
                <View className='container_item' onClick={this.creatCode}>
                    <Image className='icon_main' src={ShengCheng} />
                    <Text className='item_text'>发起签到</Text>
                </View>
                <View className='container_item' onClick={this.scanCode}>
                    <Image className='icon_main' src={SaoMiao} />
                    <Text className='item_text'>扫码签到</Text>
                </View>
                <AtModal
                    isOpened={isOpened}
                    confirmText='确认'
                    onConfirm={ this.handleConfirm }
                    content={errorInfo}
                />
            </View>
        );
    }
}